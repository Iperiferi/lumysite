import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { ArrowRight, Globe, Palette, Smartphone, Search, Zap, Shield, Bot, Star, Clock, MapPin, MessageSquare, Utensils } from 'lucide-react';

export default function Index() {
  const { user } = useAuth();

  const features = [
    { icon: Zap, title: 'Ingen teknik krävs', desc: 'Fyll i din information i enkla fält — ingen kod, inga tekniska termer. Klart på minuter.' },
    { icon: Smartphone, title: 'Ser bra ut överallt', desc: 'Din sida anpassar sig automatiskt till mobil, surfplatta och dator.' },
    { icon: Palette, title: 'Din egen stil', desc: 'Välj färg, typsnitt och ladda upp din logga. Sidan ser ut som ditt företag.' },
    { icon: Globe, title: 'Tre språk automatiskt', desc: 'Besökare kan byta mellan svenska, engelska och tyska — utan extra jobb.' },
    { icon: Bot, title: 'Bättre chanser i AI-chattar', desc: 'Vi bygger in strukturerad data som kan hjälpa AI-tjänster som ChatGPT och Gemini att hitta dig.' },
    { icon: Shield, title: 'Egen webbadress', desc: 'Få din egen adress: lumysite.com/dittforetag — enkelt att dela och komma ihåg.' },
  ];

  const aiDataPoints = [
    { icon: Clock, label: 'Öppettider' },
    { icon: Star, label: 'Omdömen' },
    { icon: MapPin, label: 'Plats & adress' },
    { icon: Utensils, label: 'Meny & utbud' },
    { icon: MessageSquare, label: 'Kontaktinfo' },
    { icon: Search, label: 'Schema.org markup' },
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
      <section className="relative py-24 md:py-40 text-center px-4 overflow-hidden">
        {/* Decorative background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-accent/40 blur-3xl" />
        </div>

        <div className="max-w-3xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-[1.1]">
            Syns ditt företag<br />
            <span className="text-primary">på nätet?</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-3 max-w-2xl mx-auto leading-relaxed">
            LumySite ger dig en professionell sida på nätet som fungerar som en hemsida, fast enklare.
          </p>
          <p className="text-base text-muted-foreground mb-8 max-w-xl mx-auto">
            Fyll i din information, välj design och publicera. Inga tekniska kunskaper behövs.
          </p>
          <div className="flex flex-wrap justify-center gap-6 mb-10 text-sm font-medium text-muted-foreground">
            <span className="flex items-center gap-2 bg-background/80 backdrop-blur border rounded-full px-4 py-2 shadow-sm">
              <Globe className="w-4 h-4 text-primary" /> 3 språk automatiskt
            </span>
            <span className="flex items-center gap-2 bg-background/80 backdrop-blur border rounded-full px-4 py-2 shadow-sm">
              <Smartphone className="w-4 h-4 text-primary" /> Mobilanpassad
            </span>
            <span className="flex items-center gap-2 bg-background/80 backdrop-blur border rounded-full px-4 py-2 shadow-sm">
              <Shield className="w-4 h-4 text-primary" /> Egen webbadress
            </span>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" asChild className="text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-shadow">
              <Link to="/registrera">
                Kom igång <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-lg px-8 py-6">
              <a href="#demo">Se exempel</a>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-3">Byggt för dig som vill ha det enkelt</h2>
          <p className="text-center text-muted-foreground mb-12">Ingen kod. Inga tekniska termer. Bara din information.</p>
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

      {/* Demo Preview */}
      <section id="demo" className="py-16 px-4 bg-muted/40">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-3">Se hur en sida kan se ut</h2>
          <p className="text-muted-foreground mb-10 max-w-2xl mx-auto">
            Här är ett exempel på en sida byggd med LumySite. Du väljer själv färger, typsnitt och vilka sektioner som ska visas – som boende, upplevelser osv.
          </p>
          <div className="relative mx-auto max-w-4xl">
            {/* Laptop frame */}
            <div className="bg-muted rounded-t-xl pt-3 pb-0 px-3">
              <div className="flex items-center gap-1.5 mb-3 px-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
                <span className="ml-3 text-xs text-muted-foreground truncate">lumysite.com/lumysite</span>
              </div>
              <div className="rounded-t-lg overflow-hidden border border-b-0 bg-background">
                <iframe
                  src="https://lumysite.com/lumysite"
                  title="Demo — LumySite exempelsida"
                  className="w-full h-[500px] md:h-[600px]"
                  loading="lazy"
                />
              </div>
            </div>
            <div className="bg-muted/80 h-4 rounded-b-xl" />
            <div className="bg-muted/50 h-2 mx-16 rounded-b-xl" />
          </div>
          <Button size="lg" asChild className="mt-8">
            <a href="https://lumysite.com/lumysite" target="_blank" rel="noopener noreferrer">
              Öppna demosidan <ArrowRight className="ml-2 w-4 h-4" />
            </a>
          </Button>
        </div>
      </section>

      {/* AI Discovery */}
      <section className="py-16 bg-primary/5 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-medium mb-4">
              <Bot className="w-4 h-4" />
              Nytt sätt att bli hittad
            </div>
            <h2 className="text-3xl font-bold mb-4">Öka chansen att synas — även i AI-chattar</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Fler och fler frågar AI-chattar som ChatGPT, Gemini och Perplexity om var de ska äta, bo och vad de ska göra.
               Utan en sida på nätet har de ingen information att utgå ifrån, med en har du betydligt bättre chanser att bli hittad.
            </p>
          </div>

          <div className="bg-background rounded-2xl border p-8 mb-8">
            <h3 className="font-semibold text-lg mb-2 text-center">Vi bygger in det som AI-chattar ofta letar efter</h3>
            <p className="text-muted-foreground text-sm text-center mb-6">
              Varje sektion du fyller i blir strukturerad data som kan hjälpa AI att förstå din verksamhet.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {aiDataPoints.map(dp => (
                <div key={dp.label} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <dp.icon className="w-5 h-5 text-primary shrink-0" />
                  <span className="text-sm font-medium">{dp.label}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* Sections showcase */}
      <section className="py-16 bg-muted/30 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Välj vad du vill visa</h2>
          <p className="text-muted-foreground mb-3">Aktivera de delar som passar ditt företag.</p>
          <p className="text-sm text-muted-foreground mb-8">Varje sektion hjälper också AI-chattar att förstå och rekommendera din verksamhet.</p>
          <div className="flex flex-wrap justify-center gap-3">
            {['Om oss', 'Öppettider', 'Vi erbjuder', 'Bildgalleri', 'Meny', 'Evenemang', 'Boende', 'Upplevelser', 'Omdömen', 'Nyheter', 'FAQ', 'Kontakt', 'Karta'].map(s => (
              <span key={s} className="px-4 py-2 bg-background border rounded-full text-sm font-medium">{s}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16 px-4">
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
              {[
                'Egen webbadress (lumysite.com/dittforetag)',
                'Mobilanpassad design',
                'Flerspråkig (SV/EN/DE)',
                'SEO & AI-optimerad med strukturerad data',
                'Alla sektioner inkluderade',
                'Obegränsade ändringar',
              ].map(item => (
                <li key={item} className="flex items-center gap-2">
                  <span className="text-primary">✓</span> {item}
                </li>
              ))}
            </ul>
            <Button size="lg" asChild className="w-full">
              <Link to="/registrera">Kom igång <ArrowRight className="ml-2 w-4 h-4" /></Link>
            </Button>
            <p className="text-xs text-muted-foreground mt-4">Du behöver ingen teknisk kunskap — vi har gjort det enkelt.</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 text-center px-4 bg-primary text-primary-foreground">
        <h2 className="text-3xl font-bold mb-4">Redo att komma igång?</h2>
        <p className="text-lg opacity-90 mb-8">Det tar bara några minuter. Ingen teknik, bara din information.</p>
        <Button size="lg" variant="secondary" asChild className="text-lg px-8 py-6">
          <Link to="/registrera">Skapa din sida nu <ArrowRight className="ml-2 w-5 h-5" /></Link>
        </Button>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        <div className="flex justify-center gap-4 mb-2">
          <Link to="/kontakt" className="hover:underline">Kontakt</Link>
          <Link to="/cookies" className="hover:underline">Cookiepolicy</Link>
          <Link to="/integritetspolicy" className="hover:underline">Integritetspolicy</Link>
          <Link to="/anvandarvillkor" className="hover:underline">Användarvillkor</Link>
        </div>
        <p>© {new Date().getFullYear()} LumySite — Iperiferi AB</p>
      </footer>
    </div>
  );
}
