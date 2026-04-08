

## Uppdatera integritetspolicyn — punkt 5 (tredjeparter)

### Bakgrund
Koden använder tre tredjepartstjänster som inte nämns i integritetspolicyn:
- **Google Fonts** (IP skickas vid sidladdning)
- **Google Maps** (IP skickas vid iframe-visning)
- **Cloudflare** (CDN för OG-bilder)

Översättningen sker helt lokalt — inga tredjepartanrop.

### Ändringar

**Fil: `src/pages/PrivacyPolicy.tsx`**

Lägg till tre rader i tabellen under punkt 5:

| Tjänst | Syfte | Plats |
|--------|-------|-------|
| Google Fonts | Typsnittsladdning (Inter, Caveat) | USA (SCC) |
| Google Maps | Kartvisning på publika sidor (valfritt) | USA (SCC) |
| Cloudflare | CDN för bilder | Global (EU-adekvat) |

Dessa läggs till i befintlig `<tbody>` efter Stripe-raden.

### Omfattning
En enda fil, en enkel tabellutökning. Inga andra filer påverkas.

