import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { data: businesses } = await supabase
    .from("businesses")
    .select("subdomain, updated_at")
    .eq("is_published", true);

  const baseUrl = Deno.env.get("SUPABASE_URL")!;

  const urls = (businesses || []).map((b: any) => {
    const lastmod = b.updated_at ? new Date(b.updated_at).toISOString().split("T")[0] : new Date().toISOString().split("T")[0];
    return `  <url>
    <loc>https://lumysite.lovable.app/${encodeURIComponent(b.subdomain)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
  });

  // Also add render-site URLs for direct bot access
  const renderUrls = (businesses || []).map((b: any) => {
    const lastmod = b.updated_at ? new Date(b.updated_at).toISOString().split("T")[0] : new Date().toISOString().split("T")[0];
    return `  <url>
    <loc>${baseUrl}/functions/v1/render-site?subdomain=${encodeURIComponent(b.subdomain)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`;
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...urls, ...renderUrls].join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: {
      ...corsHeaders,
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
});
