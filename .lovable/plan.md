

# Innehållsredigerare för sektioner i dashboarden

## Vad som byggs
Varje aktiverad sektion i "Sektioner"-fliken ska kunna fyllas med innehåll direkt i dashboarden. Under varje toggle visas en inline-redigerare när sektionen är aktiverad.

## Sektionstyper och deras fält

| Sektion | Fält | Uppladdning |
|---------|------|-------------|
| **Tjänster** | Namn, Beskrivning | Nej |
| **Galleri** | Bild, Alt-text | Ja (bild) |
| **Meny** | Titel, Innehåll (text), PDF | Ja (PDF) |
| **Evenemang** | Titel, Beskrivning, Datum, Bild | Ja (bild) |
| **Boende** | Namn, Beskrivning, Bild | Ja (bild) |
| **Upplevelser** | Namn, Beskrivning, Bild | Ja (bild) |
| **Omdömen** | Författare, Innehåll | Nej |
| **Nyheter** | Titel, Innehåll, Datum, Bild | Ja (bild) |

## Implementering

### 1. Skapa editorkomponenter (`src/components/dashboard/`)
En komponent per sektionstyp. Alla följer samma mönster:
- Tar emot `businessId` som prop
- Använder `useQuery` för att hämta befintliga poster
- CRUD-operationer direkt mot databasen (inte via "Spara"-knappen)
- Lista med kort + "Lägg till"-knapp
- Bilduppladdning till storage-bucket `section-images` (behöver skapas)

### 2. Integrera i Dashboard Sektioner-fliken
Under varje toggle i `Dashboard.tsx` visas editorn inline när sektionen är aktiverad. Toggle-ändringen sparas direkt (inte bara i state).

### 3. Storage bucket
Skapa en ny storage bucket `section-images` för bilder till evenemang, boende, upplevelser, nyheter och galleri. PDF:er för meny kan gå i en `menu-files` bucket.

### Tekniska detaljer
- 8 nya komponenter i `src/components/dashboard/`: `ServicesEditor`, `GalleryEditor`, `MenuEditor`, `EventsEditor`, `AccommodationsEditor`, `ExperiencesEditor`, `TestimonialsEditor`, `NewsEditor`
- Alla tabeller har redan RLS-policies på plats
- Varje editor gör egna `insert`/`update`/`delete` och `invalidateQueries`
- Dashboard.tsx importerar editorerna och visar dem villkorligt under respektive toggle

