import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link to="/" className="text-muted-foreground hover:text-foreground"><ArrowLeft className="w-5 h-5" /></Link>
          <span className="font-bold text-xl text-primary">LumySite</span>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-2">Integritetspolicy</h1>
        <p className="text-sm text-muted-foreground mb-8">Senast uppdaterad: {new Date().toLocaleDateString('sv-SE')}</p>

        <div className="prose prose-sm max-w-none space-y-8 text-foreground">

          <section>
            <h2 className="text-xl font-semibold mb-3">1. Personuppgiftsansvarig</h2>
            <p className="text-muted-foreground">
              <strong>Iperiferi AB</strong><br />
              Org.nr: 559336-5090<br />
              Telefon: 070-508 54 93<br />
              E-post: josefin@iperiferi.se<br />
              Webb: <a href="https://www.iperiferi.se" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">www.iperiferi.se</a>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. Vilka uppgifter samlar vi in?</h2>
            <ul className="list-disc pl-5 text-muted-foreground space-y-1">
              <li><strong>Kontouppgifter:</strong> e-postadress och lösenord (krypterat) vid registrering</li>
              <li><strong>Företagsinformation:</strong> företagsnamn, adress, telefon, e-post, öppettider, beskrivningar</li>
              <li><strong>Bilder:</strong> logotyp, hero-bild, galleri- och eventbilder som du laddar upp</li>
              <li><strong>Betalningsuppgifter:</strong> hanteras av Stripe — vi lagrar aldrig kortnummer</li>
              <li><strong>Tekniska uppgifter:</strong> IP-adress och webbläsartyp vid inloggning (för säkerhet)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. Rättslig grund</h2>
            <p className="text-muted-foreground">Vi behandlar dina personuppgifter baserat på:</p>
            <ul className="list-disc pl-5 text-muted-foreground space-y-1">
              <li><strong>Avtal (Art. 6.1b GDPR):</strong> Behandlingen är nödvändig för att tillhandahålla tjänsten</li>
              <li><strong>Rättslig förpliktelse (Art. 6.1c):</strong> Bokföring och skattelagstiftning</li>
              <li><strong>Berättigat intresse (Art. 6.1f):</strong> Säkerhet, förhindra missbruk, förbättra tjänsten</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. Hur länge sparas uppgifterna?</h2>
            <ul className="list-disc pl-5 text-muted-foreground space-y-1">
              <li><strong>Kontouppgifter:</strong> Så länge du har ett aktivt konto, plus 30 dagar efter uppsägning</li>
              <li><strong>Företagsdata och bilder:</strong> Raderas inom 30 dagar efter att du avslutar ditt konto</li>
              <li><strong>Betalningshistorik:</strong> Sparas i 7 år enligt bokföringslagen</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. Tredjeparter och underbiträden</h2>
            <p className="text-muted-foreground mb-3">Vi delar dina uppgifter med följande parter, alla inom EU/EES eller med adekvat skyddsnivå:</p>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left p-3 font-medium">Tjänst</th>
                    <th className="text-left p-3 font-medium">Syfte</th>
                    <th className="text-left p-3 font-medium">Plats</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr className="border-t">
                    <td className="p-3">Lovable Cloud (hosting)</td>
                    <td className="p-3">Databas, autentisering, fillagring</td>
                    <td className="p-3">EU</td>
                  </tr>
                  <tr className="border-t">
                    <td className="p-3">Stripe</td>
                    <td className="p-3">Betalningshantering</td>
                    <td className="p-3">EU/USA (SCC)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. Dina rättigheter</h2>
            <p className="text-muted-foreground mb-3">Enligt GDPR har du rätt att:</p>
            <ul className="list-disc pl-5 text-muted-foreground space-y-1">
              <li><strong>Tillgång:</strong> Begära information om vilka uppgifter vi har om dig</li>
              <li><strong>Rättelse:</strong> Korrigera felaktiga uppgifter</li>
              <li><strong>Radering:</strong> Begära att vi raderar dina uppgifter ("rätten att bli glömd")</li>
              <li><strong>Dataportabilitet:</strong> Få ut dina uppgifter i ett maskinläsbart format</li>
              <li><strong>Invändning:</strong> Invända mot behandling baserad på berättigat intresse</li>
              <li><strong>Begränsning:</strong> Begära att behandlingen begränsas tillfälligt</li>
            </ul>
            <p className="text-muted-foreground mt-3">
              Kontakta oss på <strong>josefin@iperiferi.se</strong> för att utöva dina rättigheter. Vi svarar inom 30 dagar.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">7. Klagomål</h2>
            <p className="text-muted-foreground">
              Om du anser att vi behandlar dina personuppgifter felaktigt har du rätt att lämna klagomål till
              Integritetsskyddsmyndigheten (IMY):<br />
              <a href="https://www.imy.se" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">www.imy.se</a><br />
              E-post: imy@imy.se<br />
              Telefon: 08-657 61 00
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">8. AI-användning och transparens (AI Act)</h2>
            <p className="text-muted-foreground">
              LumySite kan i framtiden använda AI-baserade funktioner för att hjälpa dig skapa och förbättra din hemsida.
              I enlighet med EU:s AI-förordning (AI Act) informerar vi om följande:
            </p>
            <ul className="list-disc pl-5 text-muted-foreground space-y-1 mt-2">
              <li><strong>Nuläge:</strong> Inga AI-funktioner är för närvarande aktiva mot slutanvändare</li>
              <li><strong>Transparens:</strong> Om AI-funktioner aktiveras kommer vi tydligt märka vilka funktioner som är AI-genererade</li>
              <li><strong>Inget automatiserat beslutsfattande:</strong> Vi fattar inga beslut som påverkar dig baserat enbart på automatiserad behandling</li>
              <li><strong>Dataskydd:</strong> AI-funktioner kommer inte att tränas på dina personuppgifter utan ditt samtycke</li>
            </ul>
            <p className="text-muted-foreground mt-3">
              Denna sektion uppdateras löpande i takt med att nya funktioner introduceras.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">9. Ändringar av denna policy</h2>
            <p className="text-muted-foreground">
              Vi kan komma att uppdatera denna integritetspolicy. Vid väsentliga ändringar meddelar vi dig
              via e-post eller genom ett meddelande i tjänsten. Den senaste versionen finns alltid tillgänglig på denna sida.
            </p>
          </section>
        </div>
      </main>

      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        <div className="flex justify-center gap-4 mb-2">
          <Link to="/cookies" className="hover:underline">Cookiepolicy</Link>
          <Link to="/anvandarvillkor" className="hover:underline">Användarvillkor</Link>
        </div>
        <p>© {new Date().getFullYear()} LumySite — Iperiferi AB</p>
      </footer>
    </div>
  );
}
