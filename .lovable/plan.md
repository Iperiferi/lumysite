

## Ändra URL-struktur: `/site/:subdomain` → `/:subdomain`

Företagssidor nås direkt som `lumysite.com/mittforetag` istället för `lumysite.com/site/mittforetag`.

### Utmaning
Ruttmönstret `/:subdomain` överlappar med fasta rutter som `/dashboard`, `/logga-in` etc. Vi måste hantera detta så att fasta rutter har prioritet.

### Plan

**1. Uppdatera `src/App.tsx`**
- Ta bort `/site/:subdomain`-rutten
- Lägg till `/:subdomain` som **sista rutt före catch-all** (`*`)
- Fasta rutter (`/dashboard`, `/logga-in`, etc.) matchar först tack vare React Router-ordning

**2. Uppdatera `src/pages/PublicSite.tsx`**
- Ändra `useParams` från `subdomain` (om det heter annorlunda) — verifiera parameterns namn
- Lägg till en guard: om parametern matchar en känd rutt (t.ex. `dashboard`, `logga-in`), rendera `NotFound` istället

**3. Uppdatera alla länkar till `/site/...`**
- Sök igenom hela kodbasen efter `/site/` och uppdatera till `/`
- Gäller troligen Dashboard, Register, och eventuella andra ställen

### Teknisk detalj
React Router matchar rutter i ordning. Genom att placera `/:subdomain` sist (före `*`) får fasta rutter alltid prioritet. Som extra säkerhet lägger vi en blocklista i PublicSite.

