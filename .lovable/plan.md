

## Lägg till DPA (personuppgiftsbiträdesavtal) i användarvillkoren

### Vad och varför
LumySite lagrar data på uppdrag av kunderna (t.ex. kontaktformulär-inlämningar, besökardata). GDPR kräver ett skriftligt biträdesavtal. Smidigast: baka in det som en ny sektion i befintliga användarvillkor, som kunden redan godkänner vid registrering.

### Ändringar

**Fil: `src/pages/TermsOfService.tsx`**

Lägg till en ny sektion **"Personuppgiftsbiträdesavtal (DPA)"** efter nuvarande punkt 4 ("Ditt innehåll"). Övriga sektioner omnumreras (5→6, 6→7, osv.).

Den nya sektionen ska innehålla:

1. **Roller** — LumySite är personuppgiftsbiträde, kunden är personuppgiftsansvarig
2. **Behandlingens syfte** — lagring och visning av innehåll och besökardata inom tjänsten
3. **Kategorier av personuppgifter** — kontaktuppgifter, IP-adresser, formulärdata
4. **Underbiträden** — hänvisning till integritetspolicyns punkt 5 (Stripe, Google, Cloudflare, Supabase)
5. **Säkerhetsåtgärder** — kryptering, åtkomstkontroll, RLS
6. **Radering** — data raderas inom 30 dagar efter kontoborttagning
7. **Kundens rättigheter** — rätt att granska, instruera, och begära radering

### Omfattning
En enda fil (`TermsOfService.tsx`), en ny sektion + omnumrering av efterföljande sektioner.

