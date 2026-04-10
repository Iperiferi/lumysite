import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

serve(async (req) => {
  const signature = req.headers.get("stripe-signature");
  const body = await req.text();

  if (!signature) {
    return new Response("Missing stripe-signature header", { status: 400 });
  }

  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
    apiVersion: "2025-08-27.basil",
  });

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      Deno.env.get("STRIPE_WEBHOOK_SECRET") || ""
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return new Response(`Webhook error: ${err.message}`, { status: 400 });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  const getEmailFromCustomer = async (customerId: string): Promise<string | null> => {
    try {
      const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
      return customer.deleted ? null : (customer.email ?? null);
    } catch {
      return null;
    }
  };

  const unpublishByEmail = async (email: string) => {
    const { data: { users } } = await supabase.auth.admin.listUsers({ perPage: 1000 });
    const user = users?.find(u => u.email === email);
    if (!user) return;
    await supabase.from("businesses").update({ is_published: false }).eq("owner_id", user.id);
    console.log(`Unpublished business for ${email}`);
  };

  const republishByEmail = async (email: string) => {
    const { data: { users } } = await supabase.auth.admin.listUsers({ perPage: 1000 });
    const user = users?.find(u => u.email === email);
    if (!user) return;
    // We don't auto-republish — user controls is_published themselves
    // But we log it for visibility
    console.log(`Subscription active/renewed for ${email} — user controls publishing`);
  };

  try {
    switch (event.type) {
      case "customer.subscription.deleted": {
        // Subscription truly ended (cancel_at_period_end reached or immediate cancellation)
        const sub = event.data.object as Stripe.Subscription;
        const email = await getEmailFromCustomer(sub.customer as string);
        if (email) await unpublishByEmail(email);
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const email = await getEmailFromCustomer(sub.customer as string);
        if (!email) break;

        if (sub.status === "active" || sub.status === "trialing") {
          await republishByEmail(email);
        } else if (sub.status === "canceled" || sub.status === "unpaid" || sub.status === "past_due") {
          // Only unpublish on truly inactive statuses, not on cancel_at_period_end
          // cancel_at_period_end still has status "active"
          await unpublishByEmail(email);
        }
        break;
      }

      case "invoice.payment_failed": {
        // Payment failed — Stripe will retry. We log but don't unpublish immediately.
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id;
        if (customerId) {
          const email = await getEmailFromCustomer(customerId);
          console.log(`Payment failed for ${email} — Stripe will retry`);
        }
        break;
      }

      case "customer.subscription.created": {
        const sub = event.data.object as Stripe.Subscription;
        const email = await getEmailFromCustomer(sub.customer as string);
        if (email) await republishByEmail(email);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  } catch (err) {
    console.error("Error processing webhook:", err.message);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { "Content-Type": "application/json" },
    status: 200,
  });
});
