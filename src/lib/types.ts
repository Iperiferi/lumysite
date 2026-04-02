export interface OpeningHour {
  day: string;
  open: string;
  close: string;
  closed: boolean;
}

export interface Business {
  id: string;
  owner_id: string;
  subdomain: string;
  business_name: string;
  short_description: string | null;
  about_text: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  google_maps_embed: string | null;
  accent_color: string;
  font_style: 'klassisk' | 'modern' | 'jordnara';
  logo_url: string | null;
  hero_image_url: string | null;
  hero_focal_point: string | null;
  is_published: boolean;
  opening_hours: OpeningHour[];
  cta_text: string;
  facebook_url: string | null;
  instagram_url: string | null;
  tiktok_url: string | null;
  youtube_url: string | null;
  linkedin_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Section {
  id: string;
  business_id: string;
  section_type: SectionType;
  is_enabled: boolean;
  sort_order: number;
}

export type SectionType = 'services' | 'gallery' | 'menu' | 'events' | 'accommodations' | 'experiences' | 'testimonials' | 'news';

export interface Service {
  id: string;
  business_id: string;
  name: string;
  description: string | null;
  sort_order: number;
}

export interface GalleryImage {
  id: string;
  business_id: string;
  image_url: string;
  alt_text: string | null;
  sort_order: number;
}

export interface MenuItem {
  id: string;
  business_id: string;
  title: string | null;
  content: string | null;
  pdf_url: string | null;
}

export interface Event {
  id: string;
  business_id: string;
  title: string;
  description: string | null;
  event_date: string | null;
  image_url: string | null;
}

export interface Accommodation {
  id: string;
  business_id: string;
  name: string;
  description: string | null;
  image_url: string | null;
}

export interface Experience {
  id: string;
  business_id: string;
  name: string;
  description: string | null;
  image_url: string | null;
}

export interface Testimonial {
  id: string;
  business_id: string;
  author_name: string;
  content: string;
}

export interface NewsItem {
  id: string;
  business_id: string;
  title: string;
  content: string | null;
  image_url: string | null;
  published_date: string | null;
}

export interface FaqItem {
  id: string;
  business_id: string;
  question: string;
  answer: string;
  sort_order: number;
}

export interface BusinessData {
  business: Business;
  sections: Section[];
  services: Service[];
  gallery: GalleryImage[];
  menu: MenuItem | null;
  events: Event[];
  accommodations: Accommodation[];
  experiences: Experience[];
  testimonials: Testimonial[];
  news: NewsItem[];
  faq: FaqItem[];
}

export const defaultOpeningHours: OpeningHour[] = [
  { day: 'monday', open: '10:00', close: '18:00', closed: false },
  { day: 'tuesday', open: '10:00', close: '18:00', closed: false },
  { day: 'wednesday', open: '10:00', close: '18:00', closed: false },
  { day: 'thursday', open: '10:00', close: '18:00', closed: false },
  { day: 'friday', open: '10:00', close: '18:00', closed: false },
  { day: 'saturday', open: '10:00', close: '16:00', closed: false },
  { day: 'sunday', open: '', close: '', closed: true },
];

export const sectionTypes: { type: SectionType; labelKey: string }[] = [
  { type: 'services', labelKey: 'nav.services' },
  { type: 'gallery', labelKey: 'nav.gallery' },
  { type: 'menu', labelKey: 'nav.menu' },
  { type: 'events', labelKey: 'nav.events' },
  { type: 'accommodations', labelKey: 'nav.accommodations' },
  { type: 'experiences', labelKey: 'nav.experiences' },
  { type: 'testimonials', labelKey: 'nav.testimonials' },
  { type: 'news', labelKey: 'nav.news' },
];

export const fontStyles = [
  { value: 'klassisk' as const, label: 'Klassisk', fontFamily: "'Georgia', 'Times New Roman', serif" },
  { value: 'modern' as const, label: 'Modern', fontFamily: "'Inter', 'Helvetica Neue', sans-serif" },
  { value: 'jordnara' as const, label: 'Jordnära', fontFamily: "'Caveat', 'Segoe Script', cursive" },
];
