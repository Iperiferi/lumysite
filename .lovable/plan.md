

## Omstrukturering av navigation och sektionsordning

### Nuläge
Navigationen visar upp till ~11 individuella menyval (Om oss, Praktisk info, Vi erbjuder, Boende, Upplevelser, Galleri, Meny, Evenemang, Omdömen, Nyheter, FAQ, Kontakt). Varje val pekar på en egen sektion. Inga grupperingar.

### Ny struktur

```text
Nav:  Om oss | Vi erbjuder | Meny | Praktisk info | Kontakt | Bildgalleri
```

**1. Om oss** — scrollar till `#om-oss`
- Om oss-text
- Nyheter (under samma rubrik)
- Omdömen (under samma rubrik)

**2. Vi erbjuder** — scrollar till `#tjanster`
- Tjänster (services)
- Boende + Upplevelser visas tillsammans i ett gemensamt grid
- Evenemang

**3. Meny** — scrollar till `#meny`
- Bara meny

**4. Praktisk info** — scrollar till `#info`
- Öppettider och kontaktinfo (befintlig layout)
- FAQ

**5. Kontakt** — scrollar till `#kontakt`
- Kontaktuppgifter
- Karta (flyttas in under kontakt-sektionen)

**6. Bildgalleri** — scrollar till `#galleri`
- Bildgalleri

### Ändringar

**Fil: `src/pages/PublicSite.tsx`**

1. **navItems-arrayen** (rad 107-120): Ersätt med 6 fasta menyval (visas villkorligt baserat på om det finns data):
   - `{ id: 'om-oss', label: 'Om oss' / t() }`
   - `{ id: 'tjanster', label: 'Vi erbjuder' / t() }` — visas om services, accommodations, experiences eller events finns
   - `{ id: 'meny', label: 'Meny' / t() }` — visas om meny finns
   - `{ id: 'info', label: 'Praktisk info' / t() }` — visas alltid (öppettider + FAQ)
   - `{ id: 'kontakt', label: 'Kontakt' / t() }`
   - `{ id: 'galleri', label: 'Bildgalleri' / t() }` — visas om galleri finns

2. **Desktop nav** (rad 186): Visa alla 6 menyval (inte bara `.slice(0, 6)`).

3. **Omordna sektionerna i `<main>`** till denna ordning:
   - **Om oss** (`#om-oss`): Behåll som nu, men lägg Nyheter och Omdömen direkt under (utan border-t, som undersektioner)
   - **Vi erbjuder** (`#tjanster`): Services-grid, sedan Boende+Upplevelser i ett gemensamt grid med gemensam rubrik ("Boende & Upplevelser"), sedan Evenemang
   - **Meny** (`#meny`): Oförändrad
   - **Praktisk info** (`#info`): Behåll öppettider + kontaktinfo, lägg FAQ under
   - **Kontakt** (`#kontakt`): Kontaktuppgifter + flytta kartan hit (ta bort separat `#hitta-hit`-sektion)
   - **Bildgalleri** (`#galleri`): Oförändrad

4. **Boende + Upplevelser ihop**: Kombinera accommodations och experiences i ett gemensamt grid under "Vi erbjuder" med en delad rubrik. Samma kortlayout för båda.

**Fil: `supabase/functions/render-site/index.ts`**
- Omordna sektionerna i bot-HTML:en i samma ordning som ovan, så att SEO-renderingen matchar.

