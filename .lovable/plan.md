

# Juridiska sidor och GDPR/AI Act-efterlevnad

## Nuläge
Inga juridiska sidor finns. Footern innehåller bara en copyright-rad.

## Sidor att skapa

### 1. Cookiepolicy (`/cookies`)
- Vilka cookies som används (sidebar-state, Supabase auth-token)
- Syfte, lagringstid, typ (nödvändig/funktionell)
- Ingen cookie-banner behövs om bara nödvändiga cookies används (vilket är fallet nu)

### 2. Integritetspolicy / Personuppgiftspolicy (`/integritetspolicy`)
- Personuppgiftsansvarig: LumySite + kontaktuppgifter (placeholder för användarens uppgifter)
- Vilka uppgifter som samlas in: e-post, företagsinfo, uppladdade bilder
- Rättslig grund: avtal (Art. 6.1b GDPR), berättigat intresse
- Lagring och radering: hur länge data sparas, rätt till radering
- Tredjeparter: Stripe (betalning), Lovable Cloud (hosting/databas)
- Registrerades rättigheter: tillgång, rättelse, radering, dataportabilitet, invändning
- Kontaktuppgifter för klagomål (IMY — Integritetsskyddsmyndigheten)

### 3. Användarvillkor (`/anvandarvillkor`)
- Tjänstebeskrivning
- Konto och ansvar
- Betalning och abonnemang (99 kr/mån)
- Rätt att avpublicera/ta bort olämpligt innehåll
- Immateriella rättigheter (användarens innehåll förblir deras)
- Ansvarsbegränsning
- Uppsägning
- Ändring av villkor

### 4. AI Act-information (integreras i integritetspolicyn)
- Om AI används i tjänsten: transparenskrav
- Nuläge: ingen AI-funktionalitet exponerad mot slutanvändare, men om det läggs till senare behövs deklaration
- Lägg till en sektion om AI-användning i integritetspolicyn som kan utökas

## Tekniska ändringar

### Nya filer
- `src/pages/CookiePolicy.tsx` — Cookiepolicy
- `src/pages/PrivacyPolicy.tsx` — Integritetspolicy + AI Act
- `src/pages/TermsOfService.tsx` — Användarvillkor

### Ändrade filer
- `src/App.tsx` — Lägg till routes: `/cookies`, `/integritetspolicy`, `/anvandarvillkor`
- `src/pages/Index.tsx` — Uppdatera footer med länkar till alla tre sidor
- `src/pages/PublicSite.tsx` — Lägg till footer-länkar på publika sidor också (kundernas besökare ska se cookiepolicy/integritetspolicy)

### Designmönster
- Enkel layout med prose-stil (max-w-3xl, typografi-klasser)
- Tillbaka-länk till startsidan
- Samma header/footer som Index-sidan
- Alla texter på svenska
- Platshållartext för kontaktuppgifter markerade med `[FYLL I]` så att du enkelt kan uppdatera dem

### Innehåll att notera
- **Rätt att avpublicera**: Tydligt i användarvillkoren att LumySite förbehåller sig rätten att avpublicera sidor med olämpligt, olagligt eller vilseledande innehåll
- **Dataportabilitet**: Användare kan begära export av sin data
- **Radering vid uppsägning**: Klargör vad som händer med data efter uppsägning
- **Stripe som underbiträde**: Nämns i integritetspolicyn
- **Inga tredjepartscookies**: Tydliggör att inga spårningscookies (Google Analytics etc.) används

