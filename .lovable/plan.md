
# LumySite — Multi-tenant hemsidebyggare för svensk turism

## Översikt
En komplett plattform där svenska turism- och besöksnäringsföretag registrerar sig, fyller i sin information och får en professionell, mobilanpassad hemsida publicerad på en subdomän (t.ex. cafefilur.lumysite.se).

---

## DEL 1: Admin & Registrering

### Registreringsflöde (steg-för-steg wizard)
1. **Skapa konto** — e-post + lösenord via Supabase Auth
2. **Välj subdomän** — realtidsvalidering att namnet är ledigt
3. **Grundinformation** — företagsnamn, kort beskrivning, om oss, adress, telefon, e-post, öppettider (per veckodag), Google Maps-länk, FAQ (upp till 6 st)
4. **Varumärke & utseende** — ladda upp logga + hero-bild, välj accentfärg (färgväljare), välj typsnitt (Klassisk/Modern/Jordnära)
5. **Innehållssektioner** — toggle på/av för varje valfri sektion, med formulär för respektive data:
   - Vi erbjuder (upp till 6 tjänster)
   - Bildgalleri (upp till 8 bilder)
   - Meny (fritext eller PDF-uppladdning)
   - Evenemang (titel, datum, beskrivning, bild)
   - Boende (upp till 6 rum/stugor)
   - Upplevelser (upp till 6 aktiviteter)
   - Omdömen (upp till 6 citat)
   - Nyheter (inlägg med titel, datum, text, bild)
6. **Publicera** — "Publicera min sida"-knapp

### Dashboard (efter registrering)
- Inloggning → översikt av sidan
- Redigera all information (samma formulär som wizard, men i flikar/sektioner)
- Aktivera/inaktivera sektioner med toggles
- Förhandsgranska sidan
- Ladda upp/byt bilder

---

## DEL 2: Publik hemsida

Dynamiskt renderad sida baserat på subdomän. Läser `cafefilur` från URL:en och hämtar data från Supabase.

### Fasta sektioner (alltid synliga)
1. **Hero** — hero-bild som bakgrund, logga, företagsnamn, kort beskrivning, CTA-knapp ("Kontakta oss")
2. **Om oss** — beskrivningstext
3. **Praktisk info** — öppettider i tabell, adress, telefon, e-post
4. **Hitta hit** — inbäddad Google Maps + adress i text
5. **Kontakt** — telefon, e-post, kontaktinfo
6. **FAQ** — expanderbara frågor och svar

### Valbara sektioner (visas om aktiverade)
7. Vi erbjuder — tjänstekort i grid
8. Bildgalleri — responsivt bildrutnät med lightbox
9. Meny — text eller inbäddad PDF
10. Evenemang — kronologisk lista med datum
11. Boende — kort med bild och beskrivning
12. Upplevelser — kort med bild och beskrivning
13. Omdömen — citatblock med namn
14. Nyheter — inläggsöversikt

### Design
- Ren, varm, skandinavisk känsla
- Accentfärg och typsnitt från företagets inställningar
- Tre typsnittsprofiler: Klassisk (serif), Modern (sans-serif), Jordnära (handskriven känsla)
- Fullt mobilanpassad, inga onödiga animationer
- Sticky navigation med sektionslänkar

### Språkstöd
- Allt UI på svenska som standard
- Besökare kan byta till engelska eller tyska via språkväljare i headern
- Översättning av statiska UI-texter (knappar, rubriker som "Om oss", "Öppettider" etc.)

---

## SEO & Strukturerad data (automatiskt)
- JSON-LD `LocalBusiness` schema med namn, beskrivning, adress, öppettider, telefon
- `<title>`: "[Företagsnamn] – [kort beskrivning]"
- `<meta description>`: Från om oss-texten
- Alt-texter på alla bilder
- Semantisk HTML med korrekt rubrikhierarki (h1 → h2 → h3)
- Dynamisk sitemap

---

## Backend (Supabase via Lovable Cloud)
- **Auth** — e-post + lösenord
- **Databas** — tabeller för businesses, sections, services, gallery_images, events, accommodations, experiences, testimonials, news, faq
- **Storage** — buckets för loggor, hero-bilder, galleri, evenemangsbilder, PDF-menyer
- **RLS** — varje företagare kan bara redigera sin egen data; publika sidor läser utan auth

---

## Sidstruktur
- `/` — Landningssida för LumySite (marknadsföring)
- `/registrera` — Registreringsflöde (wizard)
- `/logga-in` — Inloggning
- `/dashboard` — Admin-dashboard för redigering
- `/site/:subdomain` — Publik hemsida (i produktion via subdomän, i dev via route-parameter)
