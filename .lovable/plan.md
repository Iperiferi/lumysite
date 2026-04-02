

# Stripe-prenumeration för LumySite

## Vad som byggs
Månatlig prenumeration på **99 kr/mån (exkl. moms)** med Stripe. Användare måste betala innan deras sida publiceras.

## Steg

1. **Aktivera Stripe** — Koppla Stripe till projektet (kräver din Stripe secret key)
2. **Skapa produkt & pris** — "LumySite Bas" à 99 SEK/mån i Stripe
3. **Checkout-flöde** — Efter registreringswizarden → Stripe Checkout → publicering
4. **Åtkomstkontroll** — Kontrollera aktiv prenumeration innan sidan visas publikt
5. **Hantera avslut** — Webhook för att markera sidan som opublicerad vid utebliven betalning

## Flöde
```text
Registrera → Wizard → Stripe Checkout → Betalning OK → Sida publiceras
                                       → Betalning misslyckas → Försök igen
```

## Tekniska detaljer
- Stripe Checkout (hosted) för säker betalning
- Edge function för webhook (invoice.paid / subscription.deleted)
- `businesses`-tabellen får en `stripe_customer_id` och `subscription_status`-kolumn
- Publika sidor visas bara om `subscription_status = 'active'`

