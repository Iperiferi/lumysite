

## Fix: Förhindra att owner_id exponeras publikt

### Problem
Policyn "Public can read published businesses" på `businesses`-tabellen exponerar alla kolumner, inklusive `owner_id`. Policyn behövs dock eftersom barnatabellernas (services, events, etc.) RLS-policies gör `EXISTS (SELECT 1 FROM businesses WHERE is_published = true)` — utan den fungerar inte de publika läsningarna.

### Lösning
Skapa en `SECURITY DEFINER`-funktion som kontrollerar om ett business_id tillhör en publicerad verksamhet. Uppdatera alla barnatabellerss publika RLS-policies att använda denna funktion istället för en direkt `EXISTS`-fråga mot `businesses`. Därefter ta bort den publika SELECT-policyn från `businesses`-tabellen.

### Steg

**1. Databasmigration** — en enda SQL-migration:
- Skapa funktion `public.is_published_business(uuid)` med `SECURITY DEFINER`
- Uppdatera publika SELECT-policies på alla 10 barntabeller (sections, services, gallery_images, menu, events, accommodations, experiences, testimonials, news, faq) att använda `public.is_published_business(business_id)` istället för `EXISTS (...)`
- Ta bort policyn "Public can read published businesses" från `businesses`-tabellen

**2. Uppdatera säkerhetsfyndet** — markera som löst i security scanner

### Teknisk detalj

```sql
CREATE OR REPLACE FUNCTION public.is_published_business(_business_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.businesses
    WHERE id = _business_id AND is_published = true
  )
$$;
```

Inga kodändringar behövs — klienten använder redan `businesses_public`-vyn.

