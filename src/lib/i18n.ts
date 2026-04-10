export type Language = 'sv' | 'en';

const translations: Record<string, Record<Language, string>> = {
  // Navigation
  'nav.about': { sv: 'Om oss', en: 'About us' },
  'nav.info': { sv: 'Praktisk info', en: 'Practical info' },
  'nav.services': { sv: 'Vi erbjuder', en: 'Our services' },
  'nav.gallery': { sv: 'Bildgalleri', en: 'Gallery' },
  'nav.menu': { sv: 'Meny', en: 'Menu' },
  'nav.events': { sv: 'Evenemang', en: 'Events' },
  'nav.accommodations': { sv: 'Boende', en: 'Accommodations' },
  'nav.experiences': { sv: 'Upplevelser', en: 'Experiences' },
  'nav.testimonials': { sv: 'Omdömen', en: 'Reviews' },
  'nav.news': { sv: 'Nyheter', en: 'News' },
  'nav.map': { sv: 'Hitta hit', en: 'Find us' },
  'nav.contact': { sv: 'Kontakt', en: 'Contact' },
  'nav.faq': { sv: 'Vanliga frågor', en: 'FAQ' },

  // Public site
  'site.openingHours': { sv: 'Öppettider', en: 'Opening hours' },
  'site.address': { sv: 'Adress', en: 'Address' },
  'site.phone': { sv: 'Telefon', en: 'Phone' },
  'site.email': { sv: 'E-post', en: 'Email' },
  'site.closed': { sv: 'Stängt', en: 'Closed' },
  'site.readMore': { sv: 'Läs mer', en: 'Read more' },
  'site.upcomingEvents': { sv: 'Kommande evenemang', en: 'Upcoming events' },
  'site.contactUs': { sv: 'Kontakta oss', en: 'Contact us' },

  // Days
  'day.monday': { sv: 'Måndag', en: 'Monday' },
  'day.tuesday': { sv: 'Tisdag', en: 'Tuesday' },
  'day.wednesday': { sv: 'Onsdag', en: 'Wednesday' },
  'day.thursday': { sv: 'Torsdag', en: 'Thursday' },
  'day.friday': { sv: 'Fredag', en: 'Friday' },
  'day.saturday': { sv: 'Lördag', en: 'Saturday' },
  'day.sunday': { sv: 'Söndag', en: 'Sunday' },

  // Auth
  'auth.login': { sv: 'Logga in', en: 'Log in' },
  'auth.register': { sv: 'Registrera', en: 'Register' },
  'auth.logout': { sv: 'Logga ut', en: 'Log out' },
  'auth.email': { sv: 'E-post', en: 'Email' },
  'auth.password': { sv: 'Lösenord', en: 'Password' },
  'auth.noAccount': { sv: 'Har du inget konto?', en: "Don't have an account?" },
  'auth.hasAccount': { sv: 'Har du redan ett konto?', en: 'Already have an account?' },

  // Landing
  'landing.hero.title': { sv: 'Skapa din sida på nätet på minuter', en: 'Create your page online in minutes' },
  'landing.hero.subtitle': { sv: 'Det enklaste verktyget för svensk turism- och besöksnäring', en: 'The simplest tool for Swedish tourism & hospitality' },
  'landing.hero.cta': { sv: 'Kom igång gratis', en: 'Get started free' },

  // Dashboard
  'dashboard.title': { sv: 'Min sida', en: 'My site' },
  'dashboard.basicInfo': { sv: 'Grundinformation', en: 'Basic info' },
  'dashboard.branding': { sv: 'Varumärke', en: 'Branding' },
  'dashboard.sections': { sv: 'Sektioner', en: 'Sections' },
  'dashboard.preview': { sv: 'Förhandsgranska', en: 'Preview' },
  'dashboard.publish': { sv: 'Publicera', en: 'Publish' },
  'dashboard.unpublish': { sv: 'Avpublicera', en: 'Unpublish' },
  'dashboard.saved': { sv: 'Sparad!', en: 'Saved!' },
  'dashboard.save': { sv: 'Spara', en: 'Save' },
};

export function t(key: string, lang: Language = 'sv'): string {
  return translations[key]?.[lang] || translations[key]?.['sv'] || key;
}

export const dayKeys = [
  'day.monday', 'day.tuesday', 'day.wednesday', 'day.thursday',
  'day.friday', 'day.saturday', 'day.sunday'
] as const;
