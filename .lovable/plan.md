

# Valfria öppettider i registreringswizarden

## Vad som ändras
Lägg till en huvudswitch/checkbox ovanför öppettiderna i steg 2 (Information) som låter användaren välja om de vill visa öppettider eller inte. Om avaktiverad visas hela öppettidssektionen inte — och inga öppettider sparas.

## Ändringar

### `src/pages/Register.tsx`
- Lägg till ett nytt state: `showOpeningHours` (default `false`)
- Rendera en switch/checkbox med texten "Visa öppettider på sidan" ovanför öppettidsraderna
- Visa bara dagraderna om `showOpeningHours === true`
- Vid publicering: skicka `opening_hours` som tom array `[]` om `showOpeningHours` är `false`

### `src/pages/PublicSite.tsx` (om relevant)
- Visa bara öppettidssektionen om `opening_hours` har minst ett element

