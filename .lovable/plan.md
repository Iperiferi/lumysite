

# Aktivera testkonto utan betalning

Ditt konto (`info@iperiferi.se`) har skapat verksamheten "Lumysite" (subdomän: `lumysite`). Den behöver markeras som publicerad (`is_published = true`) och prenumerationskontrollen behöver kringgås.

## Vad som behöver göras

### 1. Sätt `is_published = true` i databasen
Uppdatera verksamheten med id `abfcb642-4014-4c92-a30b-5e3f99f2c5c7` till `is_published = true` via en databasuppdatering.

### 2. Kringgå prenumerationskontrollen i `useAuth`
`check-subscription` anropar Stripe och hittar ingen prenumeration, vilket gör att `subscribed` förblir `false`. Det enklaste sättet att kringgå detta utan att påverka riktiga användare:

- Uppdatera `check-subscription` edge-funktionen så att den returnerar `subscribed: true` för just din e-postadress (`info@iperiferi.se`), innan den frågar Stripe.

Alternativt, om du inte vill röra edge-funktionen, kan dashboard-koden redan fungera utan `subscribed`-flaggan — den blockerar bara publicering, och det löser steg 1.

### Teknisk detalj
- Steg 1: SQL `UPDATE businesses SET is_published = true WHERE id = 'abfcb642-...'`
- Steg 2 (om nödvändigt): Lägg till en tidig return i `check-subscription/index.ts` för test-e-posten

Ska jag genomföra detta?

