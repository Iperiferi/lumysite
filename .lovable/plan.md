

# Fix: Säkerställ att botar faktiskt får SEO-innehållet

## Problemet
Sitemap pekar botar till SPA-URL:er (`lumysite.lovable.app/subdomain`) där de får en tom sida. Den fullständiga HTML:en i `render-site` används aldrig av botar.

## Lösning

### 1. Ändra sitemap — peka botar till serve-site
Sitemap ska använda `serve-site` URL:er som primära. Dessa serverar full HTML till botar och redirectar människor till SPA:n.

**`supabase/functions/sitemap/index.ts`:**
- Primära URL:er: `{baseUrl}/functions/v1/serve-site?subdomain=X` (priority 0.8)
- Sekundära URL:er: `lumysite.lovable.app/X` (priority 0.6, för Google som kan köra JS)

### 2. Fixa Content-Type header i render-site
Testet visade att `render-site` returnerar `Content-Type: text/plain` istället för `text/html`. Detta måste fixas.

**`supabase/functions/render-site/index.ts`:** Säkerställ att Content-Type headers sätts korrekt.

### 3. Lägg till alternate-link i render-site HTML
I den renderade HTML:en, lägg till en `<link rel="alternate">` som pekar till SPA-versionen, så sökmotorer förstår sambandet.

### 4. Verifiera serve-site bot-detection
Testa att `serve-site` korrekt identifierar botar och serverar HTML vs redirectar människor.

## Filer som ändras
- `supabase/functions/sitemap/index.ts` — Byt primära URL:er till serve-site
- `supabase/functions/render-site/index.ts` — Fixa Content-Type header

## Resultat efter fix
```text
Bot-flöde:
  Sitemap → serve-site?subdomain=X → Bot detected → Full HTML (med canonical till SPA-URL)
  
Människo-flöde:  
  Sitemap → serve-site?subdomain=X → Human detected → 302 redirect → SPA
  Direkt besök → lumysite.lovable.app/X → SPA (fungerar som vanligt)
```

Botar (Bing, ChatGPT, Perplexity, Google) får alltid komplett HTML med alla meta-taggar, JSON-LD, och innehåll.
