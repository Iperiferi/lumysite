

# Förbättra Galleri-editorn: Flerbildsuppladdning

## Problem
Galleriet tillåter bara uppladdning av en bild i taget. Användaren vill kunna ladda upp flera bilder (upp till 8+) smidigt.

## Lösning

### Ändra GalleryEditor.tsx
- Lägg till `multiple` på fil-inputen så att man kan välja flera filer samtidigt
- Loopa igenom alla valda filer och ladda upp dem parallellt (eller sekventiellt för stabilitet)
- Visa en räknare/progress under uppladdning ("Laddar upp 3/5...")
- Visa befintliga bilder i ett grid (4 kolumner istället för 3 för bättre utnyttjande)
- Alt-text blir valfritt per bild (sätts tomt vid flerval, kan redigeras efteråt)
- Visa tydlig text om max antal eller bara låt användaren lägga till fritt

### Tekniska detaljer
- **En fil**: `src/components/dashboard/GalleryEditor.tsx`
- Ändra `<Input type="file">` till `multiple`
- `onChange` hanterar `e.target.files` som en lista, loopar och anropar `handleUpload` för varje fil
- Uppladdningsindikator: visa antal uppladdade / totalt
- Grid ändras till `grid-cols-4` för att visa fler bilder kompakt

