

# Fix: Blockera dashboard utan aktivt abonnemang

## Problem
Verksamheten skapas i databasen **innan** användaren betalar. Om de avbryter betalningen finns verksamheten redan, och dashboarden visar den utan att kontrollera `subscribed`-statusen.

## Lösning

### 1. Lägg till betalningsspärr i Dashboard
I `src/pages/Dashboard.tsx`: Om `subscribed` är `false` och användaren inte just kom från en lyckad checkout, visa en "betala för att fortsätta"-vy istället för den vanliga dashboarden. Denna vy innehåller en knapp som startar Stripe checkout igen.

### 2. Hantera avbruten checkout i Register
I `src/pages/Register.tsx`: Lägg till en `useEffect` som kollar `searchParams` efter `checkout=cancelled`. Om användaren redan har en verksamhet (finns i DB), visa ett meddelande om att betalningen avbröts med en knapp att försöka igen, istället för att visa registreringsformuläret på nytt.

### 3. Alternativt: Skjut upp skapandet av verksamheten
Flytta `handlePublish`-logiken så att verksamheten skapas **efter** lyckad betalning istället för innan. Det kräver att vi mellanlagrar formulärdata (t.ex. i `localStorage`) och skapar verksamheten i dashboardens `checkout=success`-hanterare.

**Rekommendation:** Alternativ 1+2 är enklast och säkrast. Alternativ 3 är renare men mer komplex.

### Tekniska detaljer

**Dashboard.tsx** — Lägg till spärr efter laddning:
- Om `!subscribed` och `!searchParams.get('checkout')`, visa ett kort med "Ditt abonnemang är inte aktivt" + knapp som anropar `create-checkout` och redirectar till Stripe.

**Register.tsx** — Hantera `checkout=cancelled`:
- Kolla om användaren redan har en verksamhet (hämta via `useOwnerBusiness`)
- Om ja, visa meddelande "Betalningen avbröts" med knapp att försöka igen (anropa `create-checkout`)
- Om nej, visa registreringsformuläret som vanligt

