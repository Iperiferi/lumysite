import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { ArrowRight, Globe, Palette, Smartphone, Search, Zap, Shield } from 'lucide-react';

export default function Index() {
  const { user } = useAuth();

  const features = [
    { icon: Zap, title: 'Klar på minuter', desc: 'Fyll i din information, välj design och publicera — klart!' },
    { icon: Smartphone, title: 'Mobilanpassad', desc: 'Din sida ser perfekt ut på alla enheter, automatiskt.' },
    { icon: Palette, title: 'Din stil', desc: 'Välj accentfärg, typsnitt och ladda upp din logga och bilder.' },
    { icon: Globe, title: 'Flerspråkig', desc: 'Besökare kan byta mellan svenska, engelska och tyska.' },
    { icon: Search, title: 'SEO inbyggt', desc: 'Automatisk sökmotoroptimering med schema markup och metataggar.' },
    { icon: Shield, title: 'Egen subdomän', desc: 'Få din egen adress: dittforetag.lumysite.se' },
  ];

  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="border-b bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <span className="font-bold text-xl text-primary">LumySite</span>
          <div className="flex items-center gap-3">
            {user ? (
              <Button asChild size="sm"><Link to="/dashboard">Min sida</Link></Button>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild><Link to="/logga-in">Logga in</Link></Button>
                <Button size="sm" asChild><Link to="/registrera">Kom igång</Link></Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-20 md:py-32 text-center px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Skapa din hemsida<br />
            <span className="text-primary">på minuter</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Den enklaste hemsidebyggaren för svensk turism- och besöksnäring.
            Fyll i din information, välj design och publicera direkt.
          </p>
          <Button size="lg" asChild className="text-lg px-8 py-6">
            <Link to="/registrera">
              Kom igång gratis <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-muted/30 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Allt du behöver</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map(f => (
              <div key={f.title} className="bg-background rounded-xl p-6 border">
                <f.icon className="w-10 h-10 text-primary mb-4" />
                <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-muted-foreground text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sections showcase */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Välj dina sektioner</h2>
          <p className="text-muted-foreground mb-8">Aktivera de delar som passar ditt företag</p>
          <div className="flex flex-wrap justify-center gap-3">
            {['Om oss', 'Öppettider', 'Vi erbjuder', 'Bildgalleri', 'Meny', 'Evenemang', 'Boende', 'Upplevelser', 'Omdömen', 'Nyheter', 'FAQ', 'Kontakt', 'Karta'].map(s => (
              <span key={s} className="px-4 py-2 bg-muted rounded-full text-sm font-medium">{s}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16 bg-muted/30 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Enkel prissättning</h2>
          <p className="text-muted-foreground mb-8">Inga dolda avgifter, inga bindningstider</p>
          <div className="bg-background rounded-2xl border-2 border-primary p-8 max-w-md mx-auto">
            <p className="text-sm font-medium text-primary mb-2">Allt inkluderat</p>
            <div className="flex items-baseline justify-center gap-1 mb-2">
              <span className="text-5xl font-bold">99</span>
              <span className="text-xl text-muted-foreground">kr/mån</span>
            </div>
            <p className="text-sm text-muted-foreground mb-6">exkl. moms</p>
            <ul className="text-sm text-left space-y-2 mb-8">
              {['Egen subdomän (dittföretag.lumysite.se)', 'Mobilanpassad design', 'Flerspråkig (SV/EN/DE)', 'SEO-optimerad', 'Alla sektioner inkluderade', 'Obegränsade ändringar'].map(item => (
                <li key={item} className="flex items-center gap-2">
                  <span className="text-primary">✓</span> {item}
                </li>
              ))}
            </ul>
            <Button size="lg" asChild className="w-full">
              <Link to="/registrera">Kom igång <ArrowRight className="ml-2 w-4 h-4" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 text-center px-4 bg-primary text-primary-foreground">
        <h2 className="text-3xl font-bold mb-4">Redo att skapa din hemsida?</h2>
        <p className="text-lg opacity-90 mb-8">Det tar bara några minuter att komma igång.</p>
        <Button size="lg" variant="secondary" asChild className="text-lg px-8 py-6">
          <Link to="/registrera">Skapa din sida nu <ArrowRight className="ml-2 w-5 h-5" /></Link>
        </Button>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} LumySite — Hemsidor för svensk turism</p>
      </footer>
    </div>
  );
}
