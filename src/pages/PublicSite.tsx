import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useBusinessBySubdomain } from '@/hooks/useBusiness';
import { type Language, t, dayKeys } from '@/lib/i18n';
import { fontStyles, type SectionType } from '@/lib/types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Phone, Mail, MapPin, Clock, Globe, Facebook, Instagram, Youtube, Linkedin } from 'lucide-react';

function SeoHead({ business }: { business: any }) {
  useEffect(() => {
    document.title = `${business.business_name} – ${business.short_description || ''}`;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', business.about_text?.slice(0, 160) || '');
    else {
      const m = document.createElement('meta');
      m.name = 'description';
      m.content = business.about_text?.slice(0, 160) || '';
      document.head.appendChild(m);
    }

    // JSON-LD
    let script = document.getElementById('jsonld');
    if (!script) { script = document.createElement('script'); script.id = 'jsonld'; script.setAttribute('type', 'application/ld+json'); document.head.appendChild(script); }
    const hours = (business.opening_hours || []).filter((h: any) => !h.closed).map((h: any) => {
      const dayMap: Record<string, string> = { monday: 'Mo', tuesday: 'Tu', wednesday: 'We', thursday: 'Th', friday: 'Fr', saturday: 'Sa', sunday: 'Su' };
      return `${dayMap[h.day]} ${h.open}-${h.close}`;
    });
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      name: business.business_name,
      description: business.short_description,
      address: business.address,
      telephone: business.phone,
      email: business.email,
      openingHours: hours,
      image: business.hero_image_url,
      logo: business.logo_url,
    });

    return () => { document.title = 'LumySite'; };
  }, [business]);
  return null;
}

export default function PublicSite() {
  const { subdomain } = useParams();
  const { data, isLoading, error } = useBusinessBySubdomain(subdomain);
  const [lang, setLang] = useState<Language>('sv');

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Laddar...</div>;
  if (!data || error) return <div className="min-h-screen flex items-center justify-center"><h1 className="text-2xl">Sidan hittades inte</h1></div>;

  const { business, sections, services, gallery, menu, events, accommodations, experiences, testimonials, news, faq } = data;
  const fontConfig = fontStyles.find(f => f.value === business.font_style) || fontStyles[1];
  const accent = business.accent_color || '#2563EB';

  const isSectionEnabled = (type: SectionType) => sections.find(s => s.section_type === type)?.is_enabled;

  const navItems = [
    { id: 'om-oss', label: t('nav.about', lang) },
    { id: 'info', label: t('nav.info', lang) },
    ...(isSectionEnabled('services') && services.length > 0 ? [{ id: 'tjanster', label: t('nav.services', lang) }] : []),
    ...(isSectionEnabled('gallery') && gallery.length > 0 ? [{ id: 'galleri', label: t('nav.gallery', lang) }] : []),
    ...(isSectionEnabled('menu') && menu ? [{ id: 'meny', label: t('nav.menu', lang) }] : []),
    ...(isSectionEnabled('events') && events.length > 0 ? [{ id: 'evenemang', label: t('nav.events', lang) }] : []),
    ...(isSectionEnabled('accommodations') && accommodations.length > 0 ? [{ id: 'boende', label: t('nav.accommodations', lang) }] : []),
    ...(isSectionEnabled('experiences') && experiences.length > 0 ? [{ id: 'upplevelser', label: t('nav.experiences', lang) }] : []),
    ...(isSectionEnabled('testimonials') && testimonials.length > 0 ? [{ id: 'omdomen', label: t('nav.testimonials', lang) }] : []),
    ...(isSectionEnabled('news') && news.length > 0 ? [{ id: 'nyheter', label: t('nav.news', lang) }] : []),
    { id: 'kontakt', label: t('nav.contact', lang) },
  ];

  const dayLabels = dayKeys.map(k => t(k, lang));

  return (
    <div style={{ fontFamily: fontConfig.fontFamily, '--accent': accent, '--accent-fg': '#fff' } as any}>
      <SeoHead business={business} />

      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {business.logo_url ? <img src={business.logo_url} alt={business.business_name} className="h-8 w-auto" /> : <span className="font-bold text-lg">{business.business_name}</span>}
          </div>
          <div className="hidden md:flex items-center gap-4 text-sm">
            {navItems.slice(0, 6).map(n => (
              <a key={n.id} href={`#${n.id}`} className="hover:opacity-70 transition">{n.label}</a>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-muted-foreground" />
            {(['sv', 'en', 'de'] as Language[]).map(l => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`text-xs px-2 py-1 rounded ${lang === l ? 'font-bold' : 'text-muted-foreground hover:text-foreground'}`}
                style={lang === l ? { backgroundColor: accent, color: '#fff' } : {}}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-[60vh] flex items-center justify-center text-center"
        style={{
          backgroundImage: business.hero_image_url ? `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${business.hero_image_url})` : undefined,
          backgroundSize: 'cover', backgroundPosition: 'center',
          backgroundColor: business.hero_image_url ? undefined : accent,
        }}
      >
        <div className="relative z-10 max-w-2xl px-4 text-white">
          {business.logo_url && <img src={business.logo_url} alt="" className="h-16 w-auto mx-auto mb-4" />}
          <h1 className="text-4xl md:text-5xl font-bold mb-3">{business.business_name}</h1>
          {business.short_description && <p className="text-lg md:text-xl mb-6 opacity-90">{business.short_description}</p>}
          <a href="#kontakt" className="inline-block px-6 py-3 rounded-lg font-medium text-lg transition hover:opacity-90"
            style={{ backgroundColor: accent, color: '#fff' }}>
            {business.cta_text || t('site.contactUs', lang)}
          </a>
        </div>
      </section>

      <main className="max-w-5xl mx-auto px-4">
        {/* Om oss */}
        <section id="om-oss" className="py-16">
          <h2 className="text-3xl font-bold mb-6" style={{ color: accent }}>{t('nav.about', lang)}</h2>
          <p className="text-lg leading-relaxed whitespace-pre-line text-muted-foreground">{business.about_text}</p>
        </section>

        {/* Praktisk info */}
        <section id="info" className="py-16 border-t">
          <h2 className="text-3xl font-bold mb-6" style={{ color: accent }}>{t('nav.info', lang)}</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {(business.opening_hours || []).length > 0 && (
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2"><Clock className="w-5 h-5" /> {t('site.openingHours', lang)}</h3>
                <div className="space-y-1">
                  {(business.opening_hours || []).map((h: any, i: number) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span>{dayLabels[i]}</span>
                      <span>{h.closed ? t('site.closed', lang) : `${h.open} – ${h.close}`}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="space-y-3">
              {business.address && (
                <div className="flex items-start gap-2"><MapPin className="w-5 h-5 mt-0.5 shrink-0" /><span>{business.address}</span></div>
              )}
              {business.phone && (
                <div className="flex items-center gap-2"><Phone className="w-5 h-5 shrink-0" /><a href={`tel:${business.phone}`} className="hover:underline">{business.phone}</a></div>
              )}
              {business.email && (
                <div className="flex items-center gap-2"><Mail className="w-5 h-5 shrink-0" /><a href={`mailto:${business.email}`} className="hover:underline">{business.email}</a></div>
              )}
            </div>
          </div>
        </section>

        {/* Services */}
        {isSectionEnabled('services') && services.length > 0 && (
          <section id="tjanster" className="py-16 border-t">
            <h2 className="text-3xl font-bold mb-8" style={{ color: accent }}>{t('nav.services', lang)}</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {services.map(s => (
                <div key={s.id} className="p-6 border rounded-xl">
                  <h3 className="font-semibold text-lg mb-2">{s.name}</h3>
                  {s.description && <p className="text-muted-foreground text-sm">{s.description}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Gallery */}
        {isSectionEnabled('gallery') && gallery.length > 0 && (
          <section id="galleri" className="py-16 border-t">
            <h2 className="text-3xl font-bold mb-8" style={{ color: accent }}>{t('nav.gallery', lang)}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {gallery.map(img => (
                <img key={img.id} src={img.image_url} alt={img.alt_text || ''} className="w-full aspect-square object-cover rounded-lg" loading="lazy" />
              ))}
            </div>
          </section>
        )}

        {/* Menu */}
        {isSectionEnabled('menu') && menu && (
          <section id="meny" className="py-16 border-t">
            <h2 className="text-3xl font-bold mb-6" style={{ color: accent }}>{menu.title || t('nav.menu', lang)}</h2>
            {menu.content && <div className="whitespace-pre-line text-muted-foreground">{menu.content}</div>}
            {menu.pdf_url && <iframe src={menu.pdf_url} className="w-full h-[600px] mt-4 border rounded" title="Menu PDF" />}
          </section>
        )}

        {/* Events */}
        {isSectionEnabled('events') && events.length > 0 && (
          <section id="evenemang" className="py-16 border-t">
            <h2 className="text-3xl font-bold mb-8" style={{ color: accent }}>{t('nav.events', lang)}</h2>
            <div className="space-y-6">
              {events.map(e => (
                <div key={e.id} className="flex gap-4 border rounded-xl p-4">
                  {e.image_url && <img src={e.image_url} alt={e.title} className="w-32 h-24 object-cover rounded" loading="lazy" />}
                  <div>
                    {e.event_date && <p className="text-sm font-medium" style={{ color: accent }}>{new Date(e.event_date).toLocaleDateString('sv-SE')}</p>}
                    <h3 className="font-semibold text-lg">{e.title}</h3>
                    {e.description && <p className="text-muted-foreground text-sm mt-1">{e.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Accommodations */}
        {isSectionEnabled('accommodations') && accommodations.length > 0 && (
          <section id="boende" className="py-16 border-t">
            <h2 className="text-3xl font-bold mb-8" style={{ color: accent }}>{t('nav.accommodations', lang)}</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {accommodations.map(a => (
                <div key={a.id} className="border rounded-xl overflow-hidden">
                  {a.image_url && <img src={a.image_url} alt={a.name} className="w-full h-48 object-cover" loading="lazy" />}
                  <div className="p-4">
                    <h3 className="font-semibold text-lg">{a.name}</h3>
                    {a.description && <p className="text-muted-foreground text-sm mt-1">{a.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Experiences */}
        {isSectionEnabled('experiences') && experiences.length > 0 && (
          <section id="upplevelser" className="py-16 border-t">
            <h2 className="text-3xl font-bold mb-8" style={{ color: accent }}>{t('nav.experiences', lang)}</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {experiences.map(ex => (
                <div key={ex.id} className="border rounded-xl overflow-hidden">
                  {ex.image_url && <img src={ex.image_url} alt={ex.name} className="w-full h-48 object-cover" loading="lazy" />}
                  <div className="p-4">
                    <h3 className="font-semibold text-lg">{ex.name}</h3>
                    {ex.description && <p className="text-muted-foreground text-sm mt-1">{ex.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Testimonials */}
        {isSectionEnabled('testimonials') && testimonials.length > 0 && (
          <section id="omdomen" className="py-16 border-t">
            <h2 className="text-3xl font-bold mb-8" style={{ color: accent }}>{t('nav.testimonials', lang)}</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {testimonials.map(te => (
                <blockquote key={te.id} className="p-6 border rounded-xl bg-muted/30">
                  <p className="italic text-muted-foreground mb-3">"{te.content}"</p>
                  <footer className="font-semibold">— {te.author_name}</footer>
                </blockquote>
              ))}
            </div>
          </section>
        )}

        {/* News */}
        {isSectionEnabled('news') && news.length > 0 && (
          <section id="nyheter" className="py-16 border-t">
            <h2 className="text-3xl font-bold mb-8" style={{ color: accent }}>{t('nav.news', lang)}</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {news.map(n => (
                <article key={n.id} className="border rounded-xl overflow-hidden">
                  {n.image_url && <img src={n.image_url} alt={n.title} className="w-full h-48 object-cover" loading="lazy" />}
                  <div className="p-4">
                    {n.published_date && <p className="text-sm" style={{ color: accent }}>{new Date(n.published_date).toLocaleDateString('sv-SE')}</p>}
                    <h3 className="font-semibold text-lg">{n.title}</h3>
                    {n.content && <p className="text-muted-foreground text-sm mt-1 line-clamp-3">{n.content}</p>}
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* Map */}
        {business.google_maps_embed && (
          <section id="hitta-hit" className="py-16 border-t">
            <h2 className="text-3xl font-bold mb-6" style={{ color: accent }}>{t('nav.map', lang)}</h2>
            {business.address && <p className="mb-4 flex items-center gap-2"><MapPin className="w-5 h-5" /> {business.address}</p>}
            <div className="rounded-xl overflow-hidden border">
              <iframe
                src={business.google_maps_embed}
                width="100%"
                height="400"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Google Maps"
              />
            </div>
          </section>
        )}

        {/* FAQ */}
        {faq.length > 0 && (
          <section id="faq" className="py-16 border-t">
            <h2 className="text-3xl font-bold mb-6" style={{ color: accent }}>{t('nav.faq', lang)}</h2>
            <Accordion type="single" collapsible className="max-w-2xl">
              {faq.map(f => (
                <AccordionItem key={f.id} value={f.id}>
                  <AccordionTrigger>{f.question}</AccordionTrigger>
                  <AccordionContent>{f.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>
        )}

        {/* Contact */}
        <section id="kontakt" className="py-16 border-t">
          <h2 className="text-3xl font-bold mb-6" style={{ color: accent }}>{t('nav.contact', lang)}</h2>
          <div className="space-y-3 text-lg">
            {business.phone && (
              <div className="flex items-center gap-3"><Phone className="w-5 h-5" /><a href={`tel:${business.phone}`} className="hover:underline">{business.phone}</a></div>
            )}
            {business.email && (
              <div className="flex items-center gap-3"><Mail className="w-5 h-5" /><a href={`mailto:${business.email}`} className="hover:underline">{business.email}</a></div>
            )}
            {business.address && (
              <div className="flex items-center gap-3"><MapPin className="w-5 h-5" /><span>{business.address}</span></div>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        <div className="flex justify-center gap-4 mb-2">
          <a href="/cookies" className="hover:underline">Cookiepolicy</a>
          <a href="/integritetspolicy" className="hover:underline">Integritetspolicy</a>
        </div>
        <p>© {new Date().getFullYear()} {business.business_name}</p>
        <p className="mt-1">Skapad med <a href="/" className="underline">LumySite</a></p>
      </footer>
    </div>
  );
}
