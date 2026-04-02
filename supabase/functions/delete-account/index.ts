const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@18.5.0'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Ej autentiserad' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Create client with user's token to get their ID
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    })

    const { data: { user }, error: userError } = await userClient.auth.getUser()
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Ogiltig session' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Use service role to delete all user data
    const adminClient = createClient(supabaseUrl, serviceRoleKey)

    // Get user's business
    const { data: business } = await adminClient
      .from('businesses')
      .select('id')
      .eq('owner_id', user.id)
      .maybeSingle()

    if (business) {
      const businessId = business.id

      // Delete all related data (foreign keys don't cascade from businesses)
      const tables = [
        'services', 'gallery_images', 'menu', 'events',
        'accommodations', 'experiences', 'testimonials',
        'news', 'faq', 'sections',
      ]

      for (const table of tables) {
        await adminClient.from(table).delete().eq('business_id', businessId)
      }

      // Delete the business itself
      await adminClient.from('businesses').delete().eq('id', businessId)
    }

    // Cancel Stripe subscription if exists
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY')
    if (stripeKey && user.email) {
      try {
        const stripe = new Stripe(stripeKey, { apiVersion: '2025-08-27.basil' })
        const customers = await stripe.customers.list({ email: user.email, limit: 1 })
        if (customers.data.length > 0) {
          const customerId = customers.data[0].id
          const subscriptions = await stripe.subscriptions.list({ customer: customerId, status: 'active' })
          for (const sub of subscriptions.data) {
            await stripe.subscriptions.cancel(sub.id)
            console.log('Cancelled Stripe subscription:', sub.id)
          }
          // Optionally delete the Stripe customer too
          await stripe.customers.del(customerId)
          console.log('Deleted Stripe customer:', customerId)
        }
      } catch (stripeErr) {
        console.error('Stripe cleanup error (non-fatal):', stripeErr)
      }
    }

    // Delete the auth user
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(user.id)
    if (deleteError) {
      console.error('Error deleting auth user:', deleteError)
      return new Response(JSON.stringify({ error: 'Kunde inte radera kontot' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error:', error)
    return new Response(JSON.stringify({ error: 'Serverfel' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
