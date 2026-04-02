import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, Globe, Building2 } from 'lucide-react';

export default function Contact() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link to="/" className="text-muted-foreground hover:text-foreground"><ArrowLeft className="w-5 h-5" /></Link>
          <span className="font-bold text-xl text-primary">LumySite</span>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Kontakt</h1>

        {/* Om oss */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4">Om LumySite</h2>
          <div className="text-muted-foreground space-y-4">
            <p>
              LumySite drivs av <strong>Josefin Näsström</strong> genom företaget <strong>Iperiferi AB</strong>.
              Josefin är en av Sveriges mest nischade föreläsare och rådgivare inom AI för besöksnäringen,
              med lång erfarenhet av destinationsutveckling och arbete med både små turismföretag och offentliga aktörer.
            </p>
            <p>
              Med sin bakgrund inom digital utveckling för hotell, destinationer och kommuner skapade Josefin
              LumySite för att göra det enkelt för företag inom turism- och besöksnäring att få en professionell
              hemsida — utan teknikkrångel. Fokus är att göra det begripligt och görbart för små team,
              med konkreta verktyg som går att använda direkt.
            </p>
          </div>
        </section>

        {/* Kontaktuppgifter */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4">Kontaktuppgifter</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-muted-foreground">
              <Building2 className="w-5 h-5 text-primary shrink-0" />
              <div>
                <p className="font-medium text-foreground">Iperiferi AB</p>
                <p className="text-sm">Org.nr: 559336-5090</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              <Phone className="w-5 h-5 text-primary shrink-0" />
              <a href="tel:+46705085493" className="hover:underline">070-508 54 93</a>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              <Mail className="w-5 h-5 text-primary shrink-0" />
              <a href="mailto:info@iperiferi.se" className="hover:underline">info@iperiferi.se</a>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              <Globe className="w-5 h-5 text-primary shrink-0" />
              <a href="https://www.iperiferi.se" target="_blank" rel="noopener noreferrer" className="hover:underline">www.iperiferi.se</a>
            </div>
          </div>
        </section>

        {/* Frågor */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Vanliga frågor</h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-medium mb-1">Hur kommer jag igång?</h3>
              <p className="text-muted-foreground text-sm">
                Registrera ett konto, fyll i din företagsinformation, välj design och publicera. Det tar bara några minuter.
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-1">Vad kostar det?</h3>
              <p className="text-muted-foreground text-sm">
                99 kr/mån exkl. moms. Ingen bindningstid — säg upp när du vill.
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-1">Kan jag använda en egen domän?</h3>
              <p className="text-muted-foreground text-sm">
                Just nu får du en egen adress (lumysite.com/dittforetag). Stöd för egna domäner kommer snart.
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-1">Hur säger jag upp mitt konto?</h3>
              <p className="text-muted-foreground text-sm">
                Du kan säga upp ditt abonnemang när som helst via kundportalen. Din sida förblir aktiv till slutet av betalperioden.
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-1">Vem äger mitt innehåll?</h3>
              <p className="text-muted-foreground text-sm">
                Du behåller alla rättigheter till ditt innehåll (texter, bilder, logotyper). Se våra <Link to="/anvandarvillkor" className="text-primary hover:underline">användarvillkor</Link> för detaljer.
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-1">Hur hanteras mina personuppgifter?</h3>
              <p className="text-muted-foreground text-sm">
                Vi följer GDPR och sparar bara det som behövs för att leverera tjänsten. Läs mer i vår <Link to="/integritetspolicy" className="text-primary hover:underline">integritetspolicy</Link>.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        <div className="flex justify-center gap-4 mb-2">
          <Link to="/cookies" className="hover:underline">Cookiepolicy</Link>
          <Link to="/integritetspolicy" className="hover:underline">Integritetspolicy</Link>
          <Link to="/anvandarvillkor" className="hover:underline">Användarvillkor</Link>
        </div>
        <p>© {new Date().getFullYear()} LumySite — Iperiferi AB</p>
      </footer>
    </div>
  );
}
