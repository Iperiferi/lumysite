

# SEO & Crawlbarhet – Analys och Plan

## Nuläge

Din arkitektur har **ett kritiskt problem** för SEO: de publika sidorna (`/:subdomain`) är en React SPA. När en sökmotor eller AI-crawler besöker t.ex. `lumysite.lovable.app/mitt-hotell` får den bara en tom `<div id="root"></div>` och måste köra JavaScript för att se innehållet.

- **Google**: Kan köra JS, men det tar längre tid att indexera och är inte 100% pålitligt.
- **Bing**: Mycket sämre på JS-rendering. Indexerar ofta inte SPA-innehåll.
- **AI-crawlers** (ChatGPT, Perplexity, etc.): Kör vanligtvis **inte** JavaScript alls. De ser en tom sida.

Du har redan en `render-site` edge function som genererar fullständig, SEO-optimerad HTML. Det är utmärkt — men den används inte som primär ingångspunkt.

**Ytterligare problem**: Rutten i appen är `/:subdomain` men canonical-URL:en pekar på `/site/:subdomain` — en sökväg som inte existerar.

## Plan

### 1. Skapa en prerender-proxy edge function
En ny edge function (`serve-site`) som:
- Tar emot anrop med `?subdomain=X`
- Kontrollerar `User-Agent` — om det är en bot (Googlebot, Bingbot, ChatGPT-User, Twitterbot, facebookexternalhit, etc.) returneras den fullständiga HTML:en direkt (som `render-site` redan gör)
- Om det är en vanlig användare, gör en redirect till SPA-versionen (`https://lumysite.lovable.app/{subdomain}`)

### 2. Fixa canonical-URL:er
- Ändra canonical i `SeoHead`-komponenten från `/site/${subdomain}` till `/${subdomain}` (matchar den faktiska rutten)
- Uppdatera canonical i `render-site` edge function likadant

### 3. Uppdatera sitemap edge function
- Peka SPA-URL:erna till `https://lumysite.lovable.app/{subdomain}` (utan `/site/`)
- Behåll `render-site`-URL:erna som alternativ för crawlers

### 4. Förbättra index.html med noscript-fallback
- Lägg till en `<noscript>`-sektion i `<body>` i `index.html` som visar ett meddelande och en länk till render-site-versionen, så crawlers som inte kör JS ändå hittar innehåll

### 5. Uppdatera robots.txt
- Lägg till sitemap-länk: `Sitemap: https://bqakitontnhjruiphpbq.supabase.co/functions/v1/sitemap`
- Tillåt AI-crawlers explicit (GPTBot, ChatGPT-User, anthropic-ai, etc.)

### 6. Lägg till meta-taggar för AI-crawlers
- Lägg till `<meta name="robots" content="index, follow">` i SeoHead-komponenten

## Tekniska detaljer

**Ny edge function `serve-site/index.ts`:**
- Detekterar bot user-agents via regex
- Anropar `render-site` logik direkt (eller gör intern fetch) för botar
- 302-redirect till SPA för vanliga besökare

**Filer som ändras:**
- `supabase/functions/serve-site/index.ts` (ny)
- `supabase/functions/sitemap/index.ts` (fixa URL:er)
- `supabase/functions/render-site/index.ts` (fixa canonical)
- `src/pages/PublicSite.tsx` (fixa canonical i SeoHead)
- `public/robots.txt` (lägg till sitemap + AI-bots)
- `index.html` (noscript-fallback)

