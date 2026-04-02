import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function CookiePolicy() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link to="/" className="text-muted-foreground hover:text-foreground"><ArrowLeft className="w-5 h-5" /></Link>
          <span className="font-bold text-xl text-primary">LumySite</span>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-2">Cookiepolicy</h1>
        <p className="text-sm text-muted-foreground mb-8">Senast uppdaterad: {new Date().toLocaleDateString('sv-SE')}</p>

        <div className="prose prose-sm max-w-none space-y-6 text-foreground">
          <section>
            <h2 className="text-xl font-semibold mb-3">1. Vad är cookies?</h2>
            <p className="text-muted-foreground">
              Cookies är små textfiler som lagras på din enhet när du besöker en webbplats. De används för att
              webbplatsen ska fungera korrekt och för att förbättra din upplevelse.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. Vilka cookies använder vi?</h2>
            <p className="text-muted-foreground mb-3">
              LumySite använder <strong>enbart nödvändiga cookies</strong>. Vi använder inga spårningscookies,
              marknadsföringscookies eller tredjepartscookies för analys (t.ex. Google Analytics).
            </p>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left p-3 font-medium">Cookie</th>
                    <th className="text-left p-3 font-medium">Syfte</th>
                    <th className="text-left p-3 font-medium">Typ</th>
                    <th className="text-left p-3 font-medium">Lagringstid</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr className="border-t">
                    <td className="p-3 font-mono text-xs">sb-*-auth-token</td>
                    <td className="p-3">Autentisering — håller dig inloggad</td>
                    <td className="p-3">Nödvändig</td>
                    <td className="p-3">Session / 7 dagar</td>
                  </tr>
                  <tr className="border-t">
                    <td className="p-3 font-mono text-xs">sidebar:state</td>
                    <td className="p-3">Sparar sidopanelens öppna/stängda läge</td>
                    <td className="p-3">Funktionell</td>
                    <td className="p-3">Persistent</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. Behövs samtycke?</h2>
            <p className="text-muted-foreground">
              Eftersom vi enbart använder cookies som är <strong>strikt nödvändiga</strong> för att tjänsten ska fungera,
              krävs inget separat samtycke enligt EU:s ePrivacy-direktiv och svensk lag (LEK). Dessa cookies
              omfattas av undantaget i artikel 5.3 i ePrivacy-direktivet.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. Hantera cookies</h2>
            <p className="text-muted-foreground">
              Du kan blockera eller radera cookies via din webbläsares inställningar. Observera att om du
              blockerar nödvändiga cookies kan tjänsten sluta fungera korrekt (t.ex. kan du inte förbli inloggad).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. Kontakt</h2>
            <p className="text-muted-foreground">
              Har du frågor om vår användning av cookies? Kontakta oss på{' '}
              <strong>[FYLL I: e-postadress]</strong>.
            </p>
          </section>
        </div>
      </main>

      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        <div className="flex justify-center gap-4 mb-2">
          <Link to="/integritetspolicy" className="hover:underline">Integritetspolicy</Link>
          <Link to="/anvandarvillkor" className="hover:underline">Användarvillkor</Link>
        </div>
        <p>© {new Date().getFullYear()} LumySite</p>
      </footer>
    </div>
  );
}
