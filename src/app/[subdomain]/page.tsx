import { notFound, redirect } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import type { Metadata } from 'next';
import PublicSiteClient from './PublicSiteClient';
import type { BusinessData } from '@/lib/types';

const SUPABASE_URL = 'https://rceyevpxtwyiunybomye.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJjZXlldnB4dHd5aXVueWJvbXllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3MjkzNjksImV4cCI6MjA5MTMwNTM2OX0.O-gPkC3iA2uq3QYM2qR7zu6I0BuneNqu1E81n7bAVvM';

export const revalidate = 60; // ISR: cache at edge for 60s, revalidate in background

const RESERVED_ROUTES = [
  'dashboard', 'logga-in', 'registrera', 'cookies',
  'integritetspolicy', 'anvandarvillkor', 'kontakt', 'konto',
];

function getSupabase() {
  const key = SERVICE_ROLE_KEY || ANON_KEY;
  return createClient(SUPABASE_URL, key, { auth: { persistSession: false } });
}

async function fetchBusinessData(subdomain: string): Promise<BusinessData | null> {
  const supabase = getSupabase();

  const { data: business, error } = await supabase
    .from('businesses_public')
    .select('*')
    .eq('subdomain', subdomain)
    .maybeSingle();

  if (error || !business) return null;

  const id = business.id;

  const [sections, services, gallery, menu, events, accommodations, experiences, testimonials, news, faq] =
    await Promise.all([
      supabase.from('sections').select('*').eq('business_id', id).order('sort_order'),
      supabase.from('services').select('*').eq('business_id', id).order('sort_order'),
      supabase.from('gallery_images').select('*').eq('business_id', id).order('sort_order'),
      supabase.from('menu').select('*').eq('business_id', id).maybeSingle(),
      supabase.from('events').select('*').eq('business_id', id).order('event_date'),
      supabase.from('accommodations').select('*').eq('business_id', id).order('sort_order'),
      supabase.from('experiences').select('*').eq('business_id', id).order('sort_order'),
      supabase.from('testimonials').select('*').eq('business_id', id).order('sort_order'),
      supabase.from('news').select('*').eq('business_id', id).order('published_date', { ascending: false }),
      supabase.from('faq').select('*').eq('business_id', id).order('sort_order'),
    ]);

  return {
    business: { ...business, opening_hours: (business.opening_hours as any) || [] },
    sections: sections.data || [],
    services: services.data || [],
    gallery: gallery.data || [],
    menu: menu.data || null,
    events: events.data || [],
    accommodations: accommodations.data || [],
    experiences: experiences.data || [],
    testimonials: testimonials.data || [],
    news: news.data || [],
    faq: faq.data || [],
  } as BusinessData;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ subdomain: string }>;
}): Promise<Metadata> {
  const { subdomain } = await params;
  if (RESERVED_ROUTES.includes(subdomain)) return {};

  const data = await fetchBusinessData(subdomain);
  if (!data) return { title: 'Sidan hittades inte' };

  const { business } = data;
  const title = `${business.business_name}${business.short_description ? ` – ${business.short_description}` : ''}`;
  const description = business.about_text?.slice(0, 160) || business.short_description || '';
  const url = `https://lumysite.com/${subdomain}`;

  const hours = (business.opening_hours || [])
    .filter((h: any) => !h.closed)
    .map((h: any) => {
      const dayMap: Record<string, string> = { monday: 'Mo', tuesday: 'Tu', wednesday: 'We', thursday: 'Th', friday: 'Fr', saturday: 'Sa', sunday: 'Su' };
      return `${dayMap[h.day]} ${h.open}-${h.close}`;
    });

  const sameAs = [business.facebook_url, business.instagram_url, business.tiktok_url, business.youtube_url, business.linkedin_url].filter(Boolean);

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: 'website',
      ...(business.hero_image_url ? { images: [business.hero_image_url] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(business.hero_image_url ? { images: [business.hero_image_url] } : {}),
    },
  };
}

export default async function PublicSitePage({
  params,
}: {
  params: Promise<{ subdomain: string }>;
}) {
  const { subdomain } = await params;

  if (RESERVED_ROUTES.includes(subdomain)) redirect('/');

  const data = await fetchBusinessData(subdomain);
  if (!data) notFound();

  const { business } = data;
  const url = `https://lumysite.com/${subdomain}`;

  const hours = (business.opening_hours || [])
    .filter((h: any) => !h.closed)
    .map((h: any) => {
      const dayMap: Record<string, string> = { monday: 'Mo', tuesday: 'Tu', wednesday: 'We', thursday: 'Th', friday: 'Fr', saturday: 'Sa', sunday: 'Su' };
      return `${dayMap[h.day]} ${h.open}-${h.close}`;
    });

  const sameAs = [business.facebook_url, business.instagram_url, business.tiktok_url, business.youtube_url, business.linkedin_url].filter(Boolean);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: business.business_name,
    description: business.short_description,
    url,
    ...(business.address ? { address: { '@type': 'PostalAddress', streetAddress: business.address } } : {}),
    telephone: business.phone,
    email: business.email,
    openingHours: hours,
    image: business.hero_image_url,
    logo: business.logo_url,
    ...(sameAs.length > 0 ? { sameAs } : {}),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PublicSiteClient data={data} subdomain={subdomain} />
    </>
  );
}
