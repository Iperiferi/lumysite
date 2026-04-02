
-- Timestamp update function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Main businesses table
CREATE TABLE public.businesses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subdomain TEXT NOT NULL UNIQUE,
  business_name TEXT NOT NULL,
  short_description TEXT,
  about_text TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  google_maps_embed TEXT,
  accent_color TEXT DEFAULT '#2563EB',
  font_style TEXT DEFAULT 'modern' CHECK (font_style IN ('klassisk', 'modern', 'jordnara')),
  logo_url TEXT,
  hero_image_url TEXT,
  is_published BOOLEAN DEFAULT false,
  opening_hours JSONB DEFAULT '[]'::jsonb,
  cta_text TEXT DEFAULT 'Kontakta oss',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_businesses_subdomain ON public.businesses (subdomain);
CREATE INDEX idx_businesses_owner ON public.businesses (owner_id);

ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read published businesses" ON public.businesses
  FOR SELECT USING (is_published = true);
CREATE POLICY "Owners can read own business" ON public.businesses
  FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "Owners can insert own business" ON public.businesses
  FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owners can update own business" ON public.businesses
  FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Owners can delete own business" ON public.businesses
  FOR DELETE USING (auth.uid() = owner_id);

CREATE TRIGGER update_businesses_updated_at
  BEFORE UPDATE ON public.businesses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- FAQ table
CREATE TABLE public.faq (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.faq ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read faq" ON public.faq
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND is_published = true));
CREATE POLICY "Owners can read own faq" ON public.faq
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid()));
CREATE POLICY "Owners can insert faq" ON public.faq
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid()));
CREATE POLICY "Owners can update faq" ON public.faq
  FOR UPDATE USING (EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid()));
CREATE POLICY "Owners can delete faq" ON public.faq
  FOR DELETE USING (EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid()));

-- Sections toggle table
CREATE TABLE public.sections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  section_type TEXT NOT NULL CHECK (section_type IN ('services','gallery','menu','events','accommodations','experiences','testimonials','news')),
  is_enabled BOOLEAN DEFAULT false,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(business_id, section_type)
);

ALTER TABLE public.sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read enabled sections" ON public.sections
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND is_published = true));
CREATE POLICY "Owners can manage sections" ON public.sections
  FOR ALL USING (EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid()));

-- Services
CREATE TABLE public.services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read services" ON public.services FOR SELECT USING (EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND is_published = true));
CREATE POLICY "Owner read services" ON public.services FOR SELECT USING (EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid()));
CREATE POLICY "Owner insert services" ON public.services FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid()));
CREATE POLICY "Owner update services" ON public.services FOR UPDATE USING (EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid()));
CREATE POLICY "Owner delete services" ON public.services FOR DELETE USING (EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid()));

-- Gallery images
CREATE TABLE public.gallery_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  alt_text TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read gallery" ON public.gallery_images FOR SELECT USING (EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND is_published = true));
CREATE POLICY "Owner read gallery" ON public.gallery_images FOR SELECT USING (EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid()));
CREATE POLICY "Owner insert gallery" ON public.gallery_images FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid()));
CREATE POLICY "Owner update gallery" ON public.gallery_images FOR UPDATE USING (EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid()));
CREATE POLICY "Owner delete gallery" ON public.gallery_images FOR DELETE USING (EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid()));

-- Menu
CREATE TABLE public.menu (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE UNIQUE,
  title TEXT,
  content TEXT,
  pdf_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.menu ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read menu" ON public.menu FOR SELECT USING (EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND is_published = true));
CREATE POLICY "Owner read menu" ON public.menu FOR SELECT USING (EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid()));
CREATE POLICY "Owner insert menu" ON public.menu FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid()));
CREATE POLICY "Owner update menu" ON public.menu FOR UPDATE USING (EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid()));
CREATE POLICY "Owner delete menu" ON public.menu FOR DELETE USING (EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid()));

CREATE TRIGGER update_menu_updated_at BEFORE UPDATE ON public.menu FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Events
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE,
  image_url TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read events" ON public.events FOR SELECT USING (EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND is_published = true));
CREATE POLICY "Owner read events" ON public.events FOR SELECT USING (EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid()));
CREATE POLICY "Owner insert events" ON public.events FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid()));
CREATE POLICY "Owner update events" ON public.events FOR UPDATE USING (EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid()));
CREATE POLICY "Owner delete events" ON public.events FOR DELETE USING (EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid()));

-- Accommodations
CREATE TABLE public.accommodations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.accommodations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read accommodations" ON public.accommodations FOR SELECT USING (EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND is_published = true));
CREATE POLICY "Owner read accommodations" ON public.accommodations FOR SELECT USING (EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid()));
CREATE POLICY "Owner insert accommodations" ON public.accommodations FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid()));
CREATE POLICY "Owner update accommodations" ON public.accommodations FOR UPDATE USING (EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid()));
CREATE POLICY "Owner delete accommodations" ON public.accommodations FOR DELETE USING (EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid()));

-- Experiences
CREATE TABLE public.experiences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read experiences" ON public.experiences FOR SELECT USING (EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND is_published = true));
CREATE POLICY "Owner read experiences" ON public.experiences FOR SELECT USING (EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid()));
CREATE POLICY "Owner insert experiences" ON public.experiences FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid()));
CREATE POLICY "Owner update experiences" ON public.experiences FOR UPDATE USING (EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid()));
CREATE POLICY "Owner delete experiences" ON public.experiences FOR DELETE USING (EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid()));

-- Testimonials
CREATE TABLE public.testimonials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  content TEXT NOT NULL,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read testimonials" ON public.testimonials FOR SELECT USING (EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND is_published = true));
CREATE POLICY "Owner read testimonials" ON public.testimonials FOR SELECT USING (EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid()));
CREATE POLICY "Owner insert testimonials" ON public.testimonials FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid()));
CREATE POLICY "Owner update testimonials" ON public.testimonials FOR UPDATE USING (EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid()));
CREATE POLICY "Owner delete testimonials" ON public.testimonials FOR DELETE USING (EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid()));

-- News
CREATE TABLE public.news (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  image_url TEXT,
  published_date DATE DEFAULT CURRENT_DATE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read news" ON public.news FOR SELECT USING (EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND is_published = true));
CREATE POLICY "Owner read news" ON public.news FOR SELECT USING (EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid()));
CREATE POLICY "Owner insert news" ON public.news FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid()));
CREATE POLICY "Owner update news" ON public.news FOR UPDATE USING (EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid()));
CREATE POLICY "Owner delete news" ON public.news FOR DELETE USING (EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid()));

-- Storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('logos', 'logos', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('hero-images', 'hero-images', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('gallery', 'gallery', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('event-images', 'event-images', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('accommodation-images', 'accommodation-images', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('experience-images', 'experience-images', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('news-images', 'news-images', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('menu-pdfs', 'menu-pdfs', true);

-- Storage policies for all buckets (public read, owner write using folder structure: owner_id/filename)
DO $$
DECLARE
  bucket TEXT;
  buckets TEXT[] := ARRAY['logos','hero-images','gallery','event-images','accommodation-images','experience-images','news-images','menu-pdfs'];
BEGIN
  FOREACH bucket IN ARRAY buckets LOOP
    EXECUTE format('CREATE POLICY "Public read %s" ON storage.objects FOR SELECT USING (bucket_id = %L)', bucket, bucket);
    EXECUTE format('CREATE POLICY "Auth upload %s" ON storage.objects FOR INSERT WITH CHECK (bucket_id = %L AND auth.uid()::text = (storage.foldername(name))[1])', bucket, bucket);
    EXECUTE format('CREATE POLICY "Auth update %s" ON storage.objects FOR UPDATE USING (bucket_id = %L AND auth.uid()::text = (storage.foldername(name))[1])', bucket, bucket);
    EXECUTE format('CREATE POLICY "Auth delete %s" ON storage.objects FOR DELETE USING (bucket_id = %L AND auth.uid()::text = (storage.foldername(name))[1])', bucket, bucket);
  END LOOP;
END $$;
