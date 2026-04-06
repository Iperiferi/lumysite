import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function escapeHtml(str: string | null | undefined): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

const dayNames: Record<string, string> = {
  monday: "Måndag", tuesday: "Tisdag", wednesday: "Onsdag",
  thursday: "Torsdag", friday: "Fredag", saturday: "Lördag", sunday: "Söndag",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const subdomain = url.searchParams.get("subdomain");

  if (!subdomain) {
    return new Response("Missing subdomain parameter", { status: 400, headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Fetch business
  const { data: business, error } = await supabase
    .from("businesses")
    .select("*")
    .eq("subdomain", subdomain)
    .eq("is_published", true)
    .maybeSingle();

  if (error || !business) {
    return new Response("<!DOCTYPE html><html><head><title>404</title></head><body><h1>Sidan hittades inte</h1></body></html>", {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "text/html; charset=utf-8" },
    });
  }

  const id = business.id;

  // Fetch all related data in parallel
  const [sections, services, gallery, menu, events, accommodations, experiences, testimonials, news, faq] =
    await Promise.all([
      supabase.from("sections").select("*").eq("business_id", id).order("sort_order"),
      supabase.from("services").select("*").eq("business_id", id).order("sort_order"),
      supabase.from("gallery_images").select("*").eq("business_id", id).order("sort_order"),
      supabase.from("menu").select("*").eq("business_id", id).maybeSingle(),
      supabase.from("events").select("*").eq("business_id", id).order("event_date"),
      supabase.from("accommodations").select("*").eq("business_id", id).order("sort_order"),
      supabase.from("experiences").select("*").eq("business_id", id).order("sort_order"),
      supabase.from("testimonials").select("*").eq("business_id", id).order("sort_order"),
      supabase.from("news").select("*").eq("business_id", id).order("published_date", { ascending: false }),
      supabase.from("faq").select("*").eq("business_id", id).order("sort_order"),
    ]);

  const enabledSections = (sections.data || []).filter((s: any) => s.is_enabled).map((s: any) => s.section_type);
  const isEnabled = (type: string) => enabledSections.includes(type);

  const title = escapeHtml(`${business.business_name} – ${business.short_description || ""}`);
  const description = escapeHtml((business.about_text || business.short_description || "").slice(0, 160));
  const canonicalUrl = `https://lumysite.lovable.app/${subdomain}`;
  const accent = business.accent_color || "#2563EB";

  // Opening hours
  const openingHours = (business.opening_hours || []) as any[];
  const hoursHtml = openingHours.length > 0
    ? `<section><h2>Öppettider</h2><table>${openingHours.map((h: any) =>
        `<tr><td>${escapeHtml(dayNames[h.day] || h.day)}</td><td>${h.closed ? "Stängt" : `${h.open} – ${h.close}`}</td></tr>`
      ).join("")}</table></section>`
    : "";

  // JSON-LD
  const hoursLD = openingHours.filter((h: any) => !h.closed).map((h: any) => {
    const dayMap: Record<string, string> = { monday: "Mo", tuesday: "Tu", wednesday: "We", thursday: "Th", friday: "Fr", saturday: "Sa", sunday: "Su" };
    return `${dayMap[h.day]} ${h.open}-${h.close}`;
  });
  const sameAs = [business.facebook_url, business.instagram_url, business.tiktok_url, business.youtube_url, business.linkedin_url].filter(Boolean);
  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: business.business_name,
    description: business.short_description,
    url: canonicalUrl,
    address: business.address,
    telephone: business.phone,
    email: business.email,
    openingHours: hoursLD,
    image: business.hero_image_url,
    logo: business.logo_url,
    ...(sameAs.length > 0 ? { sameAs } : {}),
  });

  // Build sections HTML
  let sectionsHtml = "";

  // About
  if (business.about_text) {
    sectionsHtml += `<section><h2>Om oss</h2><p>${escapeHtml(business.about_text)}</p></section>`;
  }

  // Contact info
  const contactParts = [];
  if (business.address) contactParts.push(`<p><strong>Adress:</strong> ${escapeHtml(business.address)}</p>`);
  if (business.phone) contactParts.push(`<p><strong>Telefon:</strong> <a href="tel:${escapeHtml(business.phone)}">${escapeHtml(business.phone)}</a></p>`);
  if (business.email) contactParts.push(`<p><strong>E-post:</strong> <a href="mailto:${escapeHtml(business.email)}">${escapeHtml(business.email)}</a></p>`);
  if (contactParts.length > 0) {
    sectionsHtml += `<section><h2>Kontakt</h2><address>${contactParts.join("")}</address></section>`;
  }

  sectionsHtml += hoursHtml;

  // Services
  if (isEnabled("services") && (services.data || []).length > 0) {
    sectionsHtml += `<section><h2>Vi erbjuder</h2><ul>${(services.data || []).map((s: any) =>
      `<li><strong>${escapeHtml(s.name)}</strong>${s.description ? ` – ${escapeHtml(s.description)}` : ""}</li>`
    ).join("")}</ul></section>`;
  }

  // Accommodations
  if (isEnabled("accommodations") && (accommodations.data || []).length > 0) {
    sectionsHtml += `<section><h2>Boende</h2>${(accommodations.data || []).map((a: any) =>
      `<article><h3>${escapeHtml(a.name)}</h3>${a.image_url ? `<img src="${escapeHtml(a.image_url)}" alt="${escapeHtml(a.name)}" loading="lazy" style="max-width:400px">` : ""}${a.description ? `<p>${escapeHtml(a.description)}</p>` : ""}</article>`
    ).join("")}</section>`;
  }

  // Experiences
  if (isEnabled("experiences") && (experiences.data || []).length > 0) {
    sectionsHtml += `<section><h2>Upplevelser</h2>${(experiences.data || []).map((ex: any) =>
      `<article><h3>${escapeHtml(ex.name)}</h3>${ex.image_url ? `<img src="${escapeHtml(ex.image_url)}" alt="${escapeHtml(ex.name)}" loading="lazy" style="max-width:400px">` : ""}${ex.description ? `<p>${escapeHtml(ex.description)}</p>` : ""}</article>`
    ).join("")}</section>`;
  }

  // Gallery
  if (isEnabled("gallery") && (gallery.data || []).length > 0) {
    sectionsHtml += `<section><h2>Bildgalleri</h2>${(gallery.data || []).map((img: any) =>
      `<img src="${escapeHtml(img.image_url)}" alt="${escapeHtml(img.alt_text || business.business_name)}" loading="lazy" style="max-width:400px;margin:8px">`
    ).join("")}</section>`;
  }

  // Menu
  if (isEnabled("menu") && menu.data) {
    const m = menu.data as any;
    sectionsHtml += `<section><h2>Meny</h2>${m.title ? `<h3>${escapeHtml(m.title)}</h3>` : ""}${m.content ? `<div>${escapeHtml(m.content)}</div>` : ""}${m.pdf_url ? `<p><a href="${escapeHtml(m.pdf_url)}">Ladda ner meny (PDF)</a></p>` : ""}</section>`;
  }

  // Events
  if (isEnabled("events") && (events.data || []).length > 0) {
    sectionsHtml += `<section><h2>Evenemang</h2>${(events.data || []).map((ev: any) =>
      `<article><h3>${escapeHtml(ev.title)}</h3>${ev.event_date ? `<p><time datetime="${ev.event_date}">${ev.event_date}</time></p>` : ""}${ev.image_url ? `<img src="${escapeHtml(ev.image_url)}" alt="${escapeHtml(ev.title)}" loading="lazy" style="max-width:400px">` : ""}${ev.description ? `<p>${escapeHtml(ev.description)}</p>` : ""}</article>`
    ).join("")}</section>`;
  }

  // Testimonials
  if (isEnabled("testimonials") && (testimonials.data || []).length > 0) {
    sectionsHtml += `<section><h2>Omdömen</h2>${(testimonials.data || []).map((t: any) =>
      `<blockquote><p>${escapeHtml(t.content)}</p><footer>– ${escapeHtml(t.author_name)}</footer></blockquote>`
    ).join("")}</section>`;
  }

  // News
  if (isEnabled("news") && (news.data || []).length > 0) {
    sectionsHtml += `<section><h2>Nyheter</h2>${(news.data || []).map((n: any) =>
      `<article><h3>${escapeHtml(n.title)}</h3>${n.published_date ? `<time datetime="${n.published_date}">${n.published_date}</time>` : ""}${n.image_url ? `<img src="${escapeHtml(n.image_url)}" alt="${escapeHtml(n.title)}" loading="lazy" style="max-width:400px">` : ""}${n.content ? `<p>${escapeHtml(n.content)}</p>` : ""}</article>`
    ).join("")}</section>`;
  }

  // FAQ
  if ((faq.data || []).length > 0) {
    sectionsHtml += `<section><h2>Vanliga frågor</h2><dl>${(faq.data || []).map((f: any) =>
      `<dt><strong>${escapeHtml(f.question)}</strong></dt><dd>${escapeHtml(f.answer)}</dd>`
    ).join("")}</dl></section>`;
  }

  // Social links
  if (sameAs.length > 0) {
    sectionsHtml += `<section><h2>Följ oss</h2><ul>${sameAs.map((url: string) =>
      `<li><a href="${escapeHtml(url)}" rel="noopener">${escapeHtml(url)}</a></li>`
    ).join("")}</ul></section>`;
  }

  const html = `<!DOCTYPE html>
<html lang="sv">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<meta name="description" content="${description}">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
<meta property="og:type" content="website">
<meta property="og:url" content="${escapeHtml(canonicalUrl)}">
${business.hero_image_url ? `<meta property="og:image" content="${escapeHtml(business.hero_image_url)}">` : ""}
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${description}">
${business.hero_image_url ? `<meta name="twitter:image" content="${escapeHtml(business.hero_image_url)}">` : ""}
<link rel="canonical" href="${escapeHtml(canonicalUrl)}">
<link rel="alternate" href="${escapeHtml(canonicalUrl)}" hreflang="sv">
<script type="application/ld+json">${jsonLd}</script>
<style>
body{font-family:system-ui,sans-serif;max-width:800px;margin:0 auto;padding:20px;color:#333;line-height:1.6}
h1{color:${accent}}h2{color:${accent};border-bottom:2px solid ${accent};padding-bottom:4px;margin-top:2em}
img{border-radius:8px}table{border-collapse:collapse}td{padding:4px 16px 4px 0}
blockquote{border-left:3px solid ${accent};margin-left:0;padding-left:16px;font-style:italic}
a{color:${accent}}address{font-style:normal}
</style>
</head>
<body>
<header>
${business.logo_url ? `<img src="${escapeHtml(business.logo_url)}" alt="${escapeHtml(business.business_name)} logotyp" style="height:64px;width:auto">` : ""}
<h1>${escapeHtml(business.business_name)}</h1>
${business.short_description ? `<p><em>${escapeHtml(business.short_description)}</em></p>` : ""}
</header>
<main>
${sectionsHtml}
</main>
<footer>
<p>&copy; ${new Date().getFullYear()} ${escapeHtml(business.business_name)}</p>
</footer>
</body>
</html>`;

  return new Response(html, {
    headers: {
      ...corsHeaders,
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
});
