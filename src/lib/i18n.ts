export type Language = 'sv' | 'en' | 'de';

const translations: Record<string, Record<Language, string>> = {
  // Navigation
  'nav.about': { sv: 'Om oss', en: 'About us', de: 'Über uns' },
  'nav.info': { sv: 'Praktisk info', en: 'Practical info', de: 'Praktische Infos' },
  'nav.services': { sv: 'Vi erbjuder', en: 'Our services', de: 'Unsere Leistungen' },
  'nav.gallery': { sv: 'Bildgalleri', en: 'Gallery', de: 'Galerie' },
  'nav.menu': { sv: 'Meny', en: 'Menu', de: 'Speisekarte' },
  'nav.events': { sv: 'Evenemang', en: 'Events', de: 'Veranstaltungen' },
  'nav.accommodations': { sv: 'Boende', en: 'Accommodations', de: 'Unterkünfte' },
  'nav.experiences': { sv: 'Upplevelser', en: 'Experiences', de: 'Erlebnisse' },
  'nav.testimonials': { sv: 'Omdömen', en: 'Reviews', de: 'Bewertungen' },
  'nav.news': { sv: 'Nyheter', en: 'News', de: 'Neuigkeiten' },
  'nav.map': { sv: 'Hitta hit', en: 'Find us', de: 'So finden Sie uns' },
  'nav.contact': { sv: 'Kontakt', en: 'Contact', de: 'Kontakt' },
  'nav.faq': { sv: 'Vanliga frågor', en: 'FAQ', de: 'Häufige Fragen' },

  // Public site
  'site.openingHours': { sv: 'Öppettider', en: 'Opening hours', de: 'Öffnungszeiten' },
  'site.address': { sv: 'Adress', en: 'Address', de: 'Adresse' },
  'site.phone': { sv: 'Telefon', en: 'Phone', de: 'Telefon' },
  'site.email': { sv: 'E-post', en: 'Email', de: 'E-Mail' },
  'site.closed': { sv: 'Stängt', en: 'Closed', de: 'Geschlossen' },
  'site.readMore': { sv: 'Läs mer', en: 'Read more', de: 'Mehr lesen' },
  'site.upcomingEvents': { sv: 'Kommande evenemang', en: 'Upcoming events', de: 'Kommende Veranstaltungen' },
  'site.contactUs': { sv: 'Kontakta oss', en: 'Contact us', de: 'Kontaktieren Sie uns' },

  // Days
  'day.monday': { sv: 'Måndag', en: 'Monday', de: 'Montag' },
  'day.tuesday': { sv: 'Tisdag', en: 'Tuesday', de: 'Dienstag' },
  'day.wednesday': { sv: 'Onsdag', en: 'Wednesday', de: 'Mittwoch' },
  'day.thursday': { sv: 'Torsdag', en: 'Thursday', de: 'Donnerstag' },
  'day.friday': { sv: 'Fredag', en: 'Friday', de: 'Freitag' },
  'day.saturday': { sv: 'Lördag', en: 'Saturday', de: 'Samstag' },
  'day.sunday': { sv: 'Söndag', en: 'Sunday', de: 'Sonntag' },

  // Auth
  'auth.login': { sv: 'Logga in', en: 'Log in', de: 'Anmelden' },
  'auth.register': { sv: 'Registrera', en: 'Register', de: 'Registrieren' },
  'auth.logout': { sv: 'Logga ut', en: 'Log out', de: 'Abmelden' },
  'auth.email': { sv: 'E-post', en: 'Email', de: 'E-Mail' },
  'auth.password': { sv: 'Lösenord', en: 'Password', de: 'Passwort' },
  'auth.noAccount': { sv: 'Har du inget konto?', en: "Don't have an account?", de: 'Kein Konto?' },
  'auth.hasAccount': { sv: 'Har du redan ett konto?', en: 'Already have an account?', de: 'Bereits ein Konto?' },

  // Landing
  'landing.hero.title': { sv: 'Skapa din sida på nätet på minuter', en: 'Create your page online in minutes', de: 'Erstellen Sie Ihre Seite online in Minuten' },
  'landing.hero.subtitle': { sv: 'Det enklaste verktyget för svensk turism- och besöksnäring', en: 'The simplest tool for Swedish tourism & hospitality', de: 'Das einfachste Tool für schwedischen Tourismus' },
  'landing.hero.cta': { sv: 'Kom igång gratis', en: 'Get started free', de: 'Kostenlos starten' },

  // Dashboard
  'dashboard.title': { sv: 'Min sida', en: 'My site', de: 'Meine Seite' },
  'dashboard.basicInfo': { sv: 'Grundinformation', en: 'Basic info', de: 'Grundinfos' },
  'dashboard.branding': { sv: 'Varumärke', en: 'Branding', de: 'Branding' },
  'dashboard.sections': { sv: 'Sektioner', en: 'Sections', de: 'Bereiche' },
  'dashboard.preview': { sv: 'Förhandsgranska', en: 'Preview', de: 'Vorschau' },
  'dashboard.publish': { sv: 'Publicera', en: 'Publish', de: 'Veröffentlichen' },
  'dashboard.unpublish': { sv: 'Avpublicera', en: 'Unpublish', de: 'Deaktivieren' },
  'dashboard.saved': { sv: 'Sparad!', en: 'Saved!', de: 'Gespeichert!' },
  'dashboard.save': { sv: 'Spara', en: 'Save', de: 'Speichern' },
};

export function t(key: string, lang: Language = 'sv'): string {
  return translations[key]?.[lang] || translations[key]?.['sv'] || key;
}

export const dayKeys = [
  'day.monday', 'day.tuesday', 'day.wednesday', 'day.thursday',
  'day.friday', 'day.saturday', 'day.sunday'
] as const;
