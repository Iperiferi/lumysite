

## Problem

Kartan visas inte eftersom det sparade värdet är en **delningslänk** (`https://maps.app.goo.gl/...`) men iframe kräver en **inbäddningslänk** (`https://www.google.com/maps/embed?pb=...`). Google tillåter inte att vanliga delningslänkar visas i iframes.

## Lösning

Uppdatera kartsektionen i `PublicSite.tsx` så den hanterar båda typerna av Google Maps-länkar:

1. **Om användaren klistrar in en embed-URL** (`google.com/maps/embed`) — visa direkt i iframe som idag
2. **Om användaren klistrar in en vanlig Maps-länk** (share-länk eller google.com/maps-länk) — visa den som en klickbar länk/knapp istället för iframe, eftersom Google blockerar dessa i iframes

Alternativt kan vi använda Google Maps Embed API med `place`-läge baserat på adressen istället för att förlita sig på länken.

### Tekniska detaljer

**Fil: `src/pages/PublicSite.tsx`**
- Kontrollera om `google_maps_embed` innehåller `/maps/embed` — om ja, visa iframe
- Om nej, använd Google Maps Embed API med adressen: `https://www.google.com/maps/embed/v1/place?key=API_KEY&q={address}` — men detta kräver en API-nyckel
- Enklaste lösningen utan API-nyckel: byt till `https://maps.google.com/maps?q={address}&output=embed` som fungerar utan nyckel

**Fil: `src/pages/Dashboard.tsx` och `src/pages/Register.tsx`**
- Lägg till en hjälptext som förklarar att man ska klistra in en inbäddningslänk, eller
- Automatiskt konvertera adressen till en fungerande embed-URL

### Rekommenderad approach

Ignorera det sparade `google_maps_embed`-fältet för iframe-visning om det inte är en riktig embed-URL. Använd istället affärens `address`-fält för att generera en karta via `https://maps.google.com/maps?q=${encodeURIComponent(address)}&output=embed`. Behåll `google_maps_embed` som fallback om det faktiskt är en embed-URL.

