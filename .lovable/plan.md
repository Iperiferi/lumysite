
Mål

Få menyflödet att fungera hela vägen: uppladdning i dashboarden, korrekt sparning, rätt publik adress och en meny-PDF som faktiskt går att öppna eller ladda ner.

Det jag redan har kunnat verifiera

- Menyposten finns sparad i databasen med `title`, `content` och `pdf_url`.
- Menysektionen är aktiverad för företaget.
- PDF-bucketen är redan publik.
- Problemet ser därför inte ut att vara lagring i backend, utan snarare frontenden/publiceringsflödet och hur PDF:en exponeras.

Plan

1. Säkra den riktiga publika adressen
- Använd företagets sparade slug som enda sann källa för publik länk.
- Visa den exakta live-adressen tydligt i dashboarden.
- Om sidan inte är publicerad ännu, visa en tydlig varning att den publika länken inte fungerar förrän publicering är aktiverad.

2. Göra menyflödet tydligare i dashboarden
- Förbättra `MenuEditor` så uppladdning och spara känns som ett tydligt flöde.
- Visa skillnaden mellan “PDF uppladdad” och “PDF sparad på sidan”.
- Behåll/lägg till direktlänk till den sparade PDF:en och tydliga felmeddelanden om uppladdning eller sparning misslyckas.

3. Förenkla PDF-hanteringen på publika sidan
- Byt till två tydliga handlingar:
  - Öppna PDF
  - Ladda ner PDF
- Låt menytexten fortsätta visas även om PDF också finns.
- Lägg till enkel fallback-text om en viss webbläsare blockerar öppning eller nedladdning.

4. Städa upp URL-förvirringen i appen
- Uppdatera kvarvarande texter som fortfarande säger `.lumysite.se` eller “subdomän”.
- Justera registrering, prissättning, kontakt och villkor så allt konsekvent säger `lumysite.com/dittforetag`.
- Det minskar risken att fel adress testas och att felet ser ut som ett menyproblem.

5. Verifiera allt end-to-end
- Ladda upp en ny PDF.
- Spara menyn.
- Ladda om dashboarden och kontrollera att PDF:en fortfarande ligger kvar.
- Öppna företagssidan via rätt publika adress.
- Testa både öppning och nedladdning av PDF.
- Testa även som anonym besökare och i mobilbredd.

Berörda filer

- `src/components/dashboard/MenuEditor.tsx`
- `src/pages/PublicSite.tsx`
- `src/pages/Dashboard.tsx`
- `src/pages/Register.tsx`
- `src/pages/Index.tsx`
- `src/pages/Contact.tsx`
- `src/pages/TermsOfService.tsx`

Tekniska detaljer

- Jag ser inget som kräver databasmigration just nu.
- `menu`-raden finns redan och `menu-pdfs` är redan publik, så backend/RLS ser ut att vara OK för detta flöde.
- Routningen i koden är redan satt till `/:subdomain`; fokus blir att säkerställa att hela appen verkligen använder samma URL-format.
- Jag kommer verifiera mot den riktiga publika sidan, inte bara previewn, eftersom previewmiljön kräver inloggning och kan ge missvisande resultat.
