

## Snyggare visuell separation mellan sektioner

### Problem
Alla sektioner har samma vita bakgrund med bara en tunn `border-t` som avdelare. Det ser ihoptryckt och monotont ut.

### Lösning
Varannan sektion får en subtil bakgrundsfärg (ljusgrå) för att skapa visuell rytm. Mer generös padding och borttagna `border-t`-linjer.

### Ändringar

**Fil: `src/pages/PublicSite.tsx`**

1. **Alternating section backgrounds**: Varannan sektion (Vi erbjuder, Kontakt) får en ljusgrå bakgrund (`bg-gray-50/70`) med full bredd, medan innehållet behåller `max-w-5xl`. Detta kräver att vi bryter ut sektionerna ur `<main className="max-w-5xl">` och istället ger varje sektion full bredd med en inre container.

2. **Struktur-ändring**:
   - `<main>` blir `max-w-none` (full bredd)
   - Varje `<section>` får en wrapper med full bredd och valfri bakgrundsfärg
   - Inre innehåll wrappas i `max-w-5xl mx-auto px-4`
   - Ta bort alla `border-t` och ersätt med bakgrundsskifte

3. **Sektionslayout**:
   - `#om-oss` — vit bakgrund, `py-20`
   - `#tjanster` — `bg-gray-50/70`, `py-20`
   - `#meny` — vit bakgrund, `py-20`
   - `#info` — `bg-gray-50/70`, `py-20`
   - `#kontakt` — vit bakgrund, `py-20`
   - `#galleri` — `bg-gray-50/70`, `py-20`

4. **Ökat mellanrum**: `py-16` blir `py-20` för mer luft.

**Fil: `supabase/functions/render-site/index.ts`**
- Lägg till matchande `background-color` och padding på varannan `<section>` i bot-HTML:en.

