import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError) throw new Error(`Auth error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated");

    // Bypass for owner account
    if (user.email === "info@iperiferi.se") {
      return new Response(JSON.stringify({
        subscribed: true,
        subscription_end: null,
        trial_ends_at: null,
        is_trial_active: false,
        has_stripe_subscription: true,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 });
    }

    // Get business trial info
    const { data: business } = await supabase
      .from("businesses")
      .select("id, subdomain, trial_ends_at, is_published")
      .eq("owner_id", user.id)
      .maybeSingle();

    const trialEndsAt = business?.trial_ends_at ?? null;
    const isTrialActive = trialEndsAt ? new Date(trialEndsAt) > new Date() : false;

    // Check Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    let hasActiveSub = false;
    let subscriptionEnd: string | null = null;

    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    if (customers.data.length > 0) {
      const subs = await stripe.subscriptions.list({
        customer: customers.data[0].id,
        status: "active",
        limit: 1,
      });
      hasActiveSub = subs.data.length > 0;
      if (hasActiveSub) {
        subscriptionEnd = new Date(subs.data[0].current_period_end * 1000).toISOString();
      }
    }

    const subscribed = hasActiveSub || isTrialActive;

    // Auto-unpublish if neither trial nor Stripe subscription is active
    // Never unpublish protected demo pages
    const PROTECTED_SUBDOMAINS = ["dittforetag"];
    const isProtected = business?.subdomain && PROTECTED_SUBDOMAINS.includes(business.subdomain);
    if (!subscribed && business?.is_published && !isProtected) {
      await supabase
        .from("businesses")
        .update({ is_published: false })
        .eq("owner_id", user.id);
    }

    return new Response(JSON.stringify({
      subscribed,
      subscription_end: subscriptionEnd,
      trial_ends_at: trialEndsAt,
      is_trial_active: isTrialActive,
      has_stripe_subscription: hasActiveSub,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
