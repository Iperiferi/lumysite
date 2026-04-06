

# Fix: Content-Type header i serve-site

## Problemet
`serve-site` edge function returnerar `Content-Type: text/plain` trots att koden explicit sätter `text/html`. Detta beror sannolikt på att Supabase edge runtime's `Content-Security-Policy: default-src 'none'; sandbox` header påverkar content-type.

## Lösning
Skapa ett explicit `Headers`-objekt med rätt Content-Type och returnera det. Testa med `new Headers()` API istället för ett vanligt objekt, vilket kan ge bättre kontroll över headern.

### Fil: `supabase/functions/serve-site/index.ts`
- Byt från plain object headers till `new Headers()` för bot-svaret
- Säkerställ att `Content-Type: text/html; charset=utf-8` faktiskt sätts korrekt

### Fil: `supabase/functions/render-site/index.ts`  
- Samma fix — byt till `new Headers()` API för att garantera korrekt Content-Type

### Verifiering
- Testa med `curl_edge_functions` och Googlebot UA efter deploy
- Verifiera att `Content-Type: text/html` returneras

## Resultat
Alla botar (Google, Bing, AI-chattar) får korrekt `text/html` med fullständigt SEO-innehåll.

