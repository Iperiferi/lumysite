import { useParams, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { useBusinessBySubdomain } from '@/hooks/useBusiness';

const RESERVED_ROUTES = ['dashboard', 'logga-in', 'registrera', 'cookies', 'integritetspolicy', 'anvandarvillkor', 'kontakt', 'konto'];
import { type Language, t, dayKeys } from '@/lib/i18n';
import { fontStyles, type SectionType } from '@/lib/types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Phone, Mail, MapPin, Clock, Globe } from 'lucide-react';

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
  const isReserved = subdomain ? RESERVED_ROUTES.includes(subdomain) : false;
  const { data, isLoading, error } = useBusinessBySubdomain(isReserved ? undefined : subdomain);
  const [lang, setLang] = useState<Language>('sv');
  const [isDownloadingMenu, setIsDownloadingMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (isReserved) return <Navigate to={`/${subdomain}`} replace />;
  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Laddar...</div>;
  if (!data || error) return <div className="min-h-screen flex items-center justify-center"><h1 className="text-2xl">Sidan hittades inte</h1></div>;

  const { business, sections, services, gallery, menu, events, accommodations, experiences, testimonials, news, faq } = data;
  const fontConfig = fontStyles.find(f => f.value === business.font_style) || fontStyles[1];
  const accent = business.accent_color || '#2563EB';
  const menuFilenameBase = (menu?.title || 'meny')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9åäö]+/gi, '-')
    .replace(/^-+|-+$/g, '');
  const menuFilename = `${menuFilenameBase || 'meny'}.pdf`;

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

  const TikTokIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.88-2.88 2.89 2.89 0 0 1 2.88-2.88c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.87a8.16 8.16 0 0 0 4.76 1.52v-3.4a4.85 4.85 0 0 1-1-.3z"/></svg>
  );

  const socialLinks = [
    business.facebook_url && { url: business.facebook_url, label: 'Facebook', icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg> },
    business.instagram_url && { url: business.instagram_url, label: 'Instagram', icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg> },
    business.tiktok_url && { url: business.tiktok_url, label: 'TikTok', icon: <TikTokIcon /> },
    business.youtube_url && { url: business.youtube_url, label: 'YouTube', icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg> },
    business.linkedin_url && { url: business.linkedin_url, label: 'LinkedIn', icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg> },
  ].filter(Boolean) as { url: string; label: string; icon: React.ReactNode }[];

  const handleMenuDownload = async () => {
    if (!menu?.pdf_url || isDownloadingMenu) return;

    setIsDownloadingMenu(true);

    let downloadUrl = menu.pdf_url;
    try {
      const url = new URL(menu.pdf_url);
      url.searchParams.set('download', menuFilename);
      downloadUrl = url.toString();
    } catch {
      downloadUrl = menu.pdf_url;
    }

    try {
      const response = await fetch(downloadUrl);
      if (!response.ok) throw new Error('Download failed');

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = menuFilename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => window.URL.revokeObjectURL(blobUrl), 1000);
    } catch {
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      link.remove();
    } finally {
      setIsDownloadingMenu(false);
    }
  };

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
            <button
              className="md:hidden p-1.5 rounded-md hover:bg-gray-100 transition"
              onClick={() => setMobileMenuOpen(v => !v)}
              aria-label="Meny"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
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
        {/* Mobile nav dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-white px-4 py-3 space-y-2">
            {navItems.map(n => (
              <a
                key={n.id}
                href={`#${n.id}`}
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-sm hover:opacity-70 transition"
              >
                {n.label}
              </a>
            ))}
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="relative min-h-[60vh] flex items-center justify-center text-center"
        style={{
          backgroundImage: business.hero_image_url ? `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${business.hero_image_url})` : undefined,
          backgroundSize: 'cover', backgroundPosition: business.hero_focal_point || 'center',
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
                <img key={img.id} src={img.image_url} alt={img.alt_text || ''} className="w-full aspect-square object-cover rounded-lg" style={{ objectPosition: (img as any).focal_point || '50% 50%' }} loading="lazy" />
              ))}
            </div>
          </section>
        )}

        {/* Menu */}
        {isSectionEnabled('menu') && menu && (
          <section id="meny" className="py-16 border-t">
            <h2 className="text-3xl font-bold mb-6" style={{ color: accent }}>{menu.title || t('nav.menu', lang)}</h2>
            {menu.content && <div className="whitespace-pre-line text-muted-foreground">{menu.content}</div>}
            {menu.pdf_url && (
              <div className="mt-4 flex flex-wrap gap-3">
                <a
                  href={menu.pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  style={{ backgroundColor: accent, color: '#fff' }}
                >
                  Öppna meny (PDF)
                </a>
                <button
                  type="button"
                  onClick={handleMenuDownload}
                  disabled={isDownloadingMenu}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isDownloadingMenu ? 'Laddar ner...' : 'Ladda ner PDF'}
                </button>
              </div>
            )}
          </section>
        )}

        {/* Events */}
        {isSectionEnabled('events') && events.length > 0 && (
          <section id="evenemang" className="py-16 border-t">
            <h2 className="text-3xl font-bold mb-8" style={{ color: accent }}>{t('nav.events', lang)}</h2>
            <div className="space-y-6">
              {events.map(e => (
                <div key={e.id} className="flex gap-4 border rounded-xl p-4">
                  {e.image_url && <img src={e.image_url} alt={e.title} className="w-32 h-24 object-cover rounded" style={{ objectPosition: (e as any).focal_point || '50% 50%' }} loading="lazy" />}
                  <div>
                    {e.event_date && (
                      <p className="text-sm font-medium" style={{ color: accent }}>
                        {new Date(e.event_date).toLocaleDateString('sv-SE')}
                        {(e as any).event_end_date && (e as any).event_end_date !== e.event_date && ` – ${new Date((e as any).event_end_date).toLocaleDateString('sv-SE')}`}
                        {(e as any).event_time && `, ${(e as any).event_time.substring(0, 5)}`}
                        {(e as any).event_end_time && ` – ${(e as any).event_end_time.substring(0, 5)}`}
                      </p>
                    )}
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
                  {a.image_url && <img src={a.image_url} alt={a.name} className="w-full h-48 object-cover" style={{ objectPosition: (a as any).focal_point || '50% 50%' }} loading="lazy" />}
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
                  {ex.image_url && <img src={ex.image_url} alt={ex.name} className="w-full h-48 object-cover" style={{ objectPosition: (ex as any).focal_point || '50% 50%' }} loading="lazy" />}
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
                  {n.image_url && <img src={n.image_url} alt={n.title} className="w-full h-48 object-cover" style={{ objectPosition: (n as any).focal_point || '50% 50%' }} loading="lazy" />}
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
          {socialLinks.length > 0 && (
            <div className="flex gap-4 mt-6">
              {socialLinks.map(s => (
                <a key={s.label} href={s.url} target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition" style={{ color: accent }} aria-label={s.label}>
                  {s.icon}
                </a>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        {socialLinks.length > 0 && (
          <div className="flex justify-center gap-4 mb-4">
            {socialLinks.map(s => (
              <a key={s.label} href={s.url} target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition text-foreground" aria-label={s.label}>
                {s.icon}
              </a>
            ))}
          </div>
        )}
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
