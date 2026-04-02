

## Prerender Edge Function & Sitemap för bot-synlighet

### Översikt
Två nya backend-funktioner som serverar fullständig HTML till crawlers och en sitemap för sökmotorer. Ingen påverkan på hur sidan ser ut för vanliga besökare.

### Steg

**1. Skapa `supabase/functions/render-site/index.ts`**
- Tar `?subdomain=xxx` som query-parameter
- Hämtar business-data från `businesses_public` + alla relaterade tabeller (services, accommodations, experiences, gallery, menu, events, testimonials, news, faq) via Supabase service role key
- Bygger och returnerar en komplett HTML-sida (`Content-Type: text/html`) med:
  - Korrekt `<title>`, meta description, Open Graph, Twitter Card-taggar
  - JSON-LD (LocalBusiness)
  - All textinnehåll i semantisk HTML (`<main>`, `<section>`, `<h1>`–`<h3>`, `<p>`, `<address>`, `<img>` med alt-text)
  - Enkel inline CSS för läsbarhet (ingen JavaScript)
  - Öppettider, kontaktinfo, sociala länkar
- Returnerar 404 om subdomain inte finns eller inte är publicerad

**2. Skapa `supabase/functions/sitemap/index.ts`**
- Hämtar alla publicerade businesses från `businesses_public`
- Genererar XML-sitemap med URLs som pekar på render-site-funktionen
- `Content-Type: application/xml`

**3. Uppdatera `src/pages/PublicSite.tsx`**
- I `SeoHead`: lägg till en `<link rel="alternate">` som pekar på render-site URL:en så att crawlers som hittar SPA-versionen kan följa länken till den statiska versionen

### Filer som skapas/ändras
- `supabase/functions/render-site/index.ts` (ny)
- `supabase/functions/sitemap/index.ts` (ny)
- `src/pages/PublicSite.tsx` (liten ändring i SeoHead)

Inga databasändringar behövs — alla tabeller och RLS-policies finns redan.

