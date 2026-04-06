import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BOT_UA_REGEX = /googlebot|bingbot|yandexbot|duckduckbot|slurp|baiduspider|facebookexternalhit|twitterbot|linkedinbot|embedly|quora link preview|showyoubot|outbrain|pinterest|applebot|semrushbot|ahrefsbot|mj12bot|GPTBot|ChatGPT-User|anthropic-ai|ClaudeBot|PerplexityBot|Bytespider|cohere-ai|meta-externalagent/i;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const subdomain = url.searchParams.get("subdomain");

  if (!subdomain) {
    return new Response("Missing subdomain parameter", { status: 400, headers: corsHeaders });
  }

  const userAgent = req.headers.get("user-agent") || "";
  const isBot = BOT_UA_REGEX.test(userAgent);

  if (isBot) {
    // Serve full prerendered HTML for bots
    const renderUrl = `${Deno.env.get("SUPABASE_URL")!}/functions/v1/render-site?subdomain=${encodeURIComponent(subdomain)}`;
    try {
      const response = await fetch(renderUrl, {
        headers: {
          "Authorization": `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")!}`,
        },
      });
      const html = await response.text();
      return new Response(html, {
        status: response.status,
        headers: {
          ...corsHeaders,
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "public, max-age=3600, s-maxage=3600",
          "X-Robots-Tag": "index, follow",
        },
      });
    } catch {
      return new Response("Error rendering site", { status: 500, headers: corsHeaders });
    }
  }

  // Redirect humans to the SPA
  const spaUrl = `https://lumysite.lovable.app/${encodeURIComponent(subdomain)}`;
  return new Response(null, {
    status: 302,
    headers: {
      ...corsHeaders,
      "Location": spaUrl,
    },
  });
});
