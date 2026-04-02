import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { BusinessData } from '@/lib/types';

export function useBusinessBySubdomain(subdomain: string | undefined) {
  return useQuery({
    queryKey: ['business', subdomain],
    queryFn: async (): Promise<BusinessData | null> => {
      if (!subdomain) return null;

      const { data: business, error } = await supabase
        .from('businesses')
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
        business: {
          ...business,
          opening_hours: (business.opening_hours as any) || [],
        },
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
    },
    enabled: !!subdomain,
  });
}

export function useOwnerBusiness(userId: string | undefined) {
  return useQuery({
    queryKey: ['ownerBusiness', userId],
    queryFn: async (): Promise<BusinessData | null> => {
      if (!userId) return null;

      const { data: business } = await supabase
        .from('businesses')
        .select('*')
        .eq('owner_id', userId)
        .maybeSingle();

      if (!business) return null;

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
        business: {
          ...business,
          opening_hours: (business.opening_hours as any) || [],
        },
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
    },
    enabled: !!userId,
  });
}
