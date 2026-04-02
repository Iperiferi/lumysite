

## SEO-förbättringar för PublicSite

Uppdatera `SeoHead`-komponenten i `src/pages/PublicSite.tsx` med följande:

### Ändringar

**1. Open Graph-taggar** — Lägg till `og:title`, `og:description`, `og:image`, `og:type`, `og:url` dynamiskt i `useEffect`. Dessa gör att sidan ser bra ut vid delning på Facebook, LinkedIn, och i AI-chattar.

**2. Canonical URL** — Lägg till `<link rel="canonical">` som pekar på `https://lumysite.lovable.app/site/{subdomain}` för att undvika duplicerat innehåll.

**3. Bättre alt-texter på logo och hero** — Sätt `alt={business.business_name}` på logotypen och `alt={business.short_description || business.business_name}` på hero-bilden (istället för tomma strängar).

**4. Utökad JSON-LD** — Lägg till `url` och `sameAs` (Facebook, Instagram, TikTok, YouTube, LinkedIn) i det befintliga JSON-LD-blocket.

**5. Semantic `<main>`-tagg** — Wrappa sidinnehållet i `<main>` för bättre tillgänglighet och SEO-signaler.

### Filer som ändras
- `src/pages/PublicSite.tsx` (enda filen)

Inga databasändringar behövs.

