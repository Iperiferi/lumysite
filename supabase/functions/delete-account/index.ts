import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// All storage buckets that can contain user-uploaded files
const STORAGE_BUCKETS = [
  "logos",
  "hero-images",
  "gallery",
  "accommodation-images",
  "experience-images",
  "news-images",
  "event-images",
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Ej autentiserad" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Verify user identity via their token
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Ogiltig session" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    // ── STEP 1: Cancel Stripe subscription ────────────────────────────────────
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (stripeKey && user.email) {
      try {
        const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
        const customers = await stripe.customers.list({ email: user.email, limit: 1 });
        if (customers.data.length > 0) {
          const customerId = customers.data[0].id;
          // Cancel all active subscriptions immediately
          const subs = await stripe.subscriptions.list({ customer: customerId, status: "active" });
          for (const sub of subs.data) {
            await stripe.subscriptions.cancel(sub.id);
            console.log("[delete-account] Cancelled Stripe subscription:", sub.id);
          }
          await stripe.customers.del(customerId);
          console.log("[delete-account] Deleted Stripe customer:", customerId);
        }
      } catch (stripeErr: any) {
        // Non-fatal — log and continue so the rest of deletion proceeds
        console.error("[delete-account] Stripe cleanup error (non-fatal):", stripeErr.message);
      }
    }

    // ── STEP 2: Delete all data ────────────────────────────────────────────────
    const { data: business } = await admin
      .from("businesses")
      .select("id, subdomain")
      .eq("owner_id", user.id)
      .maybeSingle();

    if (business) {
      const bid = business.id;
      const subdomain = business.subdomain;

      // 2a. Delete all storage files for this business across every bucket
      for (const bucket of STORAGE_BUCKETS) {
        try {
          // logos and hero-images use user.id as prefix (uploaded via dashboard/registration)
          // gallery/events/accommodations/experiences/news use business.id as prefix
          // subdomain included as extra safety net
          const prefixes = [user.id, bid, subdomain];
          for (const prefix of prefixes) {
            const { data: files } = await admin.storage.from(bucket).list(prefix, { limit: 1000 });
            if (files && files.length > 0) {
              const paths = files.map((f: any) => `${prefix}/${f.name}`);
              await admin.storage.from(bucket).remove(paths);
              console.log(`[delete-account] Removed ${paths.length} file(s) from ${bucket}/${prefix}`);
            }
          }
          // Also try listing root in case files were uploaded without prefix
          const { data: rootFiles } = await admin.storage.from(bucket).list("", { limit: 1000 });
          if (rootFiles) {
            const matching = rootFiles.filter((f: any) =>
              f.name.includes(subdomain) || f.name.includes(bid)
            );
            if (matching.length > 0) {
              await admin.storage.from(bucket).remove(matching.map((f: any) => f.name));
              console.log(`[delete-account] Removed ${matching.length} root file(s) from ${bucket}`);
            }
          }
        } catch (storageErr: any) {
          console.error(`[delete-account] Storage cleanup error for ${bucket} (non-fatal):`, storageErr.message);
        }
      }

      // 2b. Delete all related DB rows
      const tables = [
        "services", "gallery_images", "menu", "events",
        "accommodations", "experiences", "testimonials",
        "news", "faq", "sections",
      ];
      for (const table of tables) {
        await admin.from(table).delete().eq("business_id", bid);
      }

      // 2c. Delete the business itself
      await admin.from("businesses").delete().eq("id", bid);
      console.log("[delete-account] Deleted business and all related data for:", subdomain);
    }

    // ── STEP 3: Delete the auth user ──────────────────────────────────────────
    const { error: deleteError } = await admin.auth.admin.deleteUser(user.id);
    if (deleteError) {
      console.error("[delete-account] Failed to delete auth user:", deleteError.message);
      return new Response(JSON.stringify({ error: "Kunde inte radera kontot" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("[delete-account] Account fully deleted for user:", user.email);
    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (err: any) {
    console.error("[delete-account] Unexpected error:", err.message);
    return new Response(JSON.stringify({ error: "Serverfel vid kontoradering" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
