import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link to="/" className="text-muted-foreground hover:text-foreground"><ArrowLeft className="w-5 h-5" /></Link>
          <span className="font-bold text-xl text-primary">LumySite</span>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-2">Användarvillkor</h1>
        <p className="text-sm text-muted-foreground mb-8">Senast uppdaterad: {new Date().toLocaleDateString('sv-SE')}</p>

        <div className="prose prose-sm max-w-none space-y-8 text-foreground">

          <section>
            <h2 className="text-xl font-semibold mb-3">1. Om tjänsten</h2>
            <p className="text-muted-foreground">
              LumySite är en webbaserad tjänst som låter företag inom turism- och besöksnäring skapa
              och publicera egna hemsidor. Tjänsten tillhandahålls av <strong>Iperiferi AB</strong> (org.nr 559336-5090).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. Registrering och konto</h2>
            <ul className="list-disc pl-5 text-muted-foreground space-y-1">
              <li>Du måste vara minst 18 år för att registrera ett konto</li>
              <li>Du ansvarar för att hålla dina inloggningsuppgifter säkra</li>
              <li>Du ansvarar för all aktivitet som sker via ditt konto</li>
              <li>Varje konto får en unik webbadress (lumysite.com/dittforetag)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. Betalning och abonnemang</h2>
            <ul className="list-disc pl-5 text-muted-foreground space-y-1">
              <li>Tjänsten kostar <strong>99 kr/mån exkl. moms</strong></li>
              <li>Betalning sker månadsvis via Stripe</li>
              <li>Abonnemanget förnyas automatiskt varje månad tills du säger upp det</li>
              <li>Uppsägning kan göras när som helst — tjänsten är aktiv till slutet av betalperioden</li>
              <li>Ingen bindningstid</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. Ditt innehåll</h2>
            <ul className="list-disc pl-5 text-muted-foreground space-y-1">
              <li>Du behåller alla rättigheter till det innehåll du publicerar (texter, bilder, logotyper)</li>
              <li>
                Du ger LumySite en begränsad rätt att visa och distribuera ditt innehåll enbart i syfte att tillhandahålla tjänsten
                <br />
                Denna rätt upphör när ditt konto avslutas och ditt innehåll raderas i enlighet med integritetspolicyn
              </li>
              <li>Du garanterar att du har rätt att använda allt innehåll du laddar upp</li>
              <li>Du ansvarar för att ditt innehåll inte bryter mot svensk lag</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. Olämpligt innehåll och rätt att avpublicera</h2>
            <p className="text-muted-foreground mb-3">
              LumySite förbehåller sig rätten att utan förvarning <strong>avpublicera, begränsa eller ta bort</strong> innehåll
              och/eller konton som:
            </p>
            <ul className="list-disc pl-5 text-muted-foreground space-y-1">
              <li>Innehåller olagligt material</li>
              <li>Gör intrång i tredje parts immateriella rättigheter</li>
              <li>Innehåller hatiskt, diskriminerande eller hotfullt innehåll</li>
              <li>Används för bedrägeri, vilseledande marknadsföring eller spam</li>
              <li>Bryter mot dessa användarvillkor på annat sätt</li>
            </ul>
            <p className="text-muted-foreground mt-3">
              Vid avpublicering kommer vi att meddela dig via e-post med en förklaring. Du har rätt att
              överklaga beslutet genom att kontakta oss.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. Tjänstens tillgänglighet</h2>
            <p className="text-muted-foreground">
              Vi strävar efter att tjänsten ska vara tillgänglig dygnet runt, men kan inte garantera
              avbrottsfri drift. Planerade underhåll meddelas i förväg när det är möjligt.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">7. Ansvarsbegränsning</h2>
            <ul className="list-disc pl-5 text-muted-foreground space-y-1">
              <li>LumySite tillhandahålls "i befintligt skick"</li>
              <li>Vi ansvarar inte för indirekta skador, utebliven vinst eller förlust av data utöver vad som krävs enligt tvingande lag</li>
              <li>Vårt sammanlagda ansvar begränsas till de avgifter du betalat under de senaste 12 månaderna</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">8. Uppsägning</h2>
            <ul className="list-disc pl-5 text-muted-foreground space-y-1">
              <li>Du kan säga upp ditt konto när som helst via kundportalen</li>
              <li>Vid uppsägning avpubliceras din sida omedelbart</li>
              <li>Dina uppgifter raderas inom 30 dagar efter uppsägning (se <Link to="/integritetspolicy" className="text-primary hover:underline">integritetspolicyn</Link>)</li>
              <li>LumySite kan säga upp ditt konto vid brott mot dessa villkor</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">9. Ändringar av villkoren</h2>
            <p className="text-muted-foreground">
              Vi kan uppdatera dessa villkor. Vid väsentliga ändringar meddelar vi dig via e-post minst
              30 dagar i förväg. Fortsatt användning av tjänsten efter att ändringar trätt i kraft innebär
              att du godkänner de nya villkoren.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">10. Tillämplig lag och tvister</h2>
            <p className="text-muted-foreground">
              Dessa villkor regleras av svensk lag. Tvister avgörs av svensk allmän domstol.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">11. Kontakt</h2>
            <p className="text-muted-foreground">
              <strong>Iperiferi AB</strong><br />
              Org.nr: 559336-5090<br />
              Telefon: 070-508 54 93<br />
              E-post: info@iperiferi.se
            </p>
          </section>
        </div>
      </main>

      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        <div className="flex justify-center gap-4 mb-2">
          <Link to="/cookies" className="hover:underline">Cookiepolicy</Link>
          <Link to="/integritetspolicy" className="hover:underline">Integritetspolicy</Link>
        </div>
        <p>© {new Date().getFullYear()} LumySite — Iperiferi AB</p>
      </footer>
    </div>
  );
}
