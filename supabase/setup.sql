-- ============================================================
-- Lumy – Full database setup script
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================================

-- ============================================================
-- 1. TRIGGER FUNCTION (no table dependencies)
-- ============================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- ============================================================
-- 2. TABLES
-- ============================================================

CREATE TABLE public.businesses (
  id                UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id          UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subdomain         TEXT        NOT NULL UNIQUE,
  business_name     TEXT        NOT NULL,
  short_description TEXT,
  about_text        TEXT,
  address           TEXT,
  phone             TEXT,
  email             TEXT,
  google_maps_embed TEXT,
  accent_color      TEXT        DEFAULT '#2563EB',
  font_style        TEXT        DEFAULT 'modern' CHECK (font_style IN ('klassisk','modern','jordnara')),
  logo_url          TEXT,
  hero_image_url    TEXT,
  hero_focal_point  TEXT        DEFAULT '50% 50%',
  is_published      BOOLEAN     DEFAULT false,
  opening_hours     JSONB       DEFAULT '[]'::jsonb,
  cta_text          TEXT        DEFAULT 'Kontakta oss',
  facebook_url      TEXT,
  instagram_url     TEXT,
  tiktok_url        TEXT,
  youtube_url       TEXT,
  linkedin_url      TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_businesses_subdomain ON public.businesses (subdomain);
CREATE INDEX        idx_businesses_owner     ON public.businesses (owner_id);

CREATE TRIGGER update_businesses_updated_at
  BEFORE UPDATE ON public.businesses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


CREATE TABLE public.faq (
  id          UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID        NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  question    TEXT        NOT NULL,
  answer      TEXT        NOT NULL,
  sort_order  INT         DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);


CREATE TABLE public.sections (
  id           UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id  UUID        NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  section_type TEXT        NOT NULL CHECK (section_type IN ('services','gallery','menu','events','accommodations','experiences','testimonials','news')),
  is_enabled   BOOLEAN     DEFAULT false,
  sort_order   INT         DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(business_id, section_type)
);


CREATE TABLE public.services (
  id          UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID        NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  name        TEXT        NOT NULL,
  description TEXT,
  sort_order  INT         DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);


CREATE TABLE public.gallery_images (
  id          UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID        NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  image_url   TEXT        NOT NULL,
  alt_text    TEXT,
  focal_point TEXT        DEFAULT '50% 50%',
  sort_order  INT         DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);


CREATE TABLE public.menu (
  id          UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID        NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE UNIQUE,
  title       TEXT,
  content     TEXT,
  pdf_url     TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER update_menu_updated_at
  BEFORE UPDATE ON public.menu
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


CREATE TABLE public.events (
  id             UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id    UUID        NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  title          TEXT        NOT NULL,
  description    TEXT,
  event_date     DATE,
  event_end_date DATE,
  event_time     TIME,
  event_end_time TIME,
  image_url      TEXT,
  focal_point    TEXT        DEFAULT '50% 50%',
  sort_order     INT         DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);


CREATE TABLE public.accommodations (
  id          UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID        NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  name        TEXT        NOT NULL,
  description TEXT,
  image_url   TEXT,
  focal_point TEXT        DEFAULT '50% 50%',
  sort_order  INT         DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);


CREATE TABLE public.experiences (
  id          UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID        NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  name        TEXT        NOT NULL,
  description TEXT,
  image_url   TEXT,
  focal_point TEXT        DEFAULT '50% 50%',
  sort_order  INT         DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);


CREATE TABLE public.testimonials (
  id          UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID        NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  author_name TEXT        NOT NULL,
  content     TEXT        NOT NULL,
  sort_order  INT         DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);


CREATE TABLE public.news (
  id             UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id    UUID        NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  title          TEXT        NOT NULL,
  content        TEXT,
  image_url      TEXT,
  focal_point    TEXT        DEFAULT '50% 50%',
  published_date DATE        DEFAULT CURRENT_DATE,
  sort_order     INT         DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 3. FUNCTIONS (reference businesses table – must exist first)
-- ============================================================

CREATE OR REPLACE FUNCTION public.owns_business_folder(folder_name text)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.businesses
    WHERE id::text = folder_name AND owner_id = auth.uid()
  )
$$;

CREATE OR REPLACE FUNCTION public.is_published_business(_business_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.businesses
    WHERE id = _business_id AND is_published = true
  )
$$;

-- ============================================================
-- 4. PUBLIC VIEW (no owner_id exposed)
-- ============================================================

CREATE VIEW public.businesses_public AS
SELECT id, subdomain, business_name, short_description, about_text,
       address, phone, email, google_maps_embed, accent_color, font_style,
       logo_url, hero_image_url, is_published, opening_hours, cta_text,
       hero_focal_point, facebook_url, instagram_url, tiktok_url,
       youtube_url, linkedin_url, created_at, updated_at
FROM public.businesses
WHERE is_published = true;

-- ============================================================
-- 5. ROW LEVEL SECURITY
-- ============================================================

-- businesses
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners can read own business"   ON public.businesses FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "Owners can insert own business" ON public.businesses FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owners can update own business" ON public.businesses FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Owners can delete own business" ON public.businesses FOR DELETE USING (auth.uid() = owner_id);

-- faq
ALTER TABLE public.faq ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read faq"  ON public.faq FOR SELECT USING (public.is_published_business(business_id));
CREATE POLICY "Owner read faq"       ON public.faq FOR SELECT USING (EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid()));
CREATE POLICY "Owner insert faq"     ON public.faq FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid()));
CREATE POLICY "Owner update faq"     ON public.faq FOR UPDATE USING (EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid()));
CREATE POLICY "Owner delete faq"     ON public.faq FOR DELETE USING (EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid()));

-- sections
ALTER TABLE public.sections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read enabled sections" ON public.sections FOR SELECT USING (public.is_published_business(business_id));
CREATE POLICY "Owners can manage sections"       ON public.sections FOR ALL USING (EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid()));

-- services
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read services"  ON public.services FOR SELECT USING (public.is_published_business(business_id));
CREATE POLICY "Owner read services"   ON public.services FOR SELECT USING (EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid()));
CREATE POLICY "Owner insert services" ON public.services FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid()));
CREATE POLICY "Owner update services" ON public.services FOR UPDATE USING (EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid()));
CREATE POLICY "Owner delete services" ON public.services FOR DELETE USING (EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid()));

-- gallery_images
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read gallery"   ON public.gallery_images FOR SELECT USING (public.is_published_business(business_id));
CREATE POLICY "Owner read gallery"    ON public.gallery_images FOR SELECT USING (EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid()));
CREATE POLICY "Owner insert gallery"  ON public.gallery_images FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid()));
CREATE POLICY "Owner update gallery"  ON public.gallery_images FOR UPDATE USING (EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid()));
CREATE POLICY "Owner delete gallery"  ON public.gallery_images FOR DELETE USING (EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid()));

-- menu
ALTER TABLE public.menu ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read menu"   ON public.menu FOR SELECT USING (public.is_published_business(business_id));
CREATE POLICY "Owner read menu"    ON public.menu FOR SELECT USING (EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid()));
CREATE POLICY "Owner insert menu"  ON public.menu FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid()));
CREATE POLICY "Owner update menu"  ON public.menu FOR UPDATE USING (EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid()));
CREATE POLICY "Owner delete menu"  ON public.menu FOR DELETE USING (EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid()));

-- events
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read events"   ON public.events FOR SELECT USING (public.is_published_business(business_id));
CREATE POLICY "Owner read events"    ON public.events FOR SELECT USING (EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid()));
CREATE POLICY "Owner insert events"  ON public.events FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid()));
CREATE POLICY "Owner update events"  ON public.events FOR UPDATE USING (EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid()));
CREATE POLICY "Owner delete events"  ON public.events FOR DELETE USING (EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid()));

-- accommodations
ALTER TABLE public.accommodations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read accommodations"   ON public.accommodations FOR SELECT USING (public.is_published_business(business_id));
CREATE POLICY "Owner read accommodations"    ON public.accommodations FOR SELECT USING (EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid()));
CREATE POLICY "Owner insert accommodations"  ON public.accommodations FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid()));
CREATE POLICY "Owner update accommodations"  ON public.accommodations FOR UPDATE USING (EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid()));
CREATE POLICY "Owner delete accommodations"  ON public.accommodations FOR DELETE USING (EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid()));

-- experiences
ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read experiences"   ON public.experiences FOR SELECT USING (public.is_published_business(business_id));
CREATE POLICY "Owner read experiences"    ON public.experiences FOR SELECT USING (EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid()));
CREATE POLICY "Owner insert experiences"  ON public.experiences FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid()));
CREATE POLICY "Owner update experiences"  ON public.experiences FOR UPDATE USING (EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid()));
CREATE POLICY "Owner delete experiences"  ON public.experiences FOR DELETE USING (EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid()));

-- testimonials
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read testimonials"   ON public.testimonials FOR SELECT USING (public.is_published_business(business_id));
CREATE POLICY "Owner read testimonials"    ON public.testimonials FOR SELECT USING (EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid()));
CREATE POLICY "Owner insert testimonials"  ON public.testimonials FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid()));
CREATE POLICY "Owner update testimonials"  ON public.testimonials FOR UPDATE USING (EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid()));
CREATE POLICY "Owner delete testimonials"  ON public.testimonials FOR DELETE USING (EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid()));

-- news
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read news"   ON public.news FOR SELECT USING (public.is_published_business(business_id));
CREATE POLICY "Owner read news"    ON public.news FOR SELECT USING (EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid()));
CREATE POLICY "Owner insert news"  ON public.news FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid()));
CREATE POLICY "Owner update news"  ON public.news FOR UPDATE USING (EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid()));
CREATE POLICY "Owner delete news"  ON public.news FOR DELETE USING (EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid()));

-- ============================================================
-- 6. STORAGE BUCKETS
-- ============================================================

INSERT INTO storage.buckets (id, name, public) VALUES
  ('logos',                'logos',                true),
  ('hero-images',          'hero-images',          true),
  ('gallery',              'gallery',              true),
  ('event-images',         'event-images',         true),
  ('accommodation-images', 'accommodation-images', true),
  ('experience-images',    'experience-images',    true),
  ('news-images',          'news-images',          true),
  ('menu-pdfs',            'menu-pdfs',            true);

-- ============================================================
-- 7. STORAGE POLICIES
-- logos & hero-images: folder = owner_id/filename
-- all other buckets:   folder = business_id/filename
-- ============================================================

-- logos
CREATE POLICY "Public read logos"  ON storage.objects FOR SELECT USING (bucket_id = 'logos');
CREATE POLICY "Auth upload logos"  ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'logos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Auth update logos"  ON storage.objects FOR UPDATE USING   (bucket_id = 'logos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Auth delete logos"  ON storage.objects FOR DELETE USING   (bucket_id = 'logos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- hero-images
CREATE POLICY "Public read hero-images"  ON storage.objects FOR SELECT USING (bucket_id = 'hero-images');
CREATE POLICY "Auth upload hero-images"  ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'hero-images' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Auth update hero-images"  ON storage.objects FOR UPDATE USING   (bucket_id = 'hero-images' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Auth delete hero-images"  ON storage.objects FOR DELETE USING   (bucket_id = 'hero-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- gallery
CREATE POLICY "Public read gallery"  ON storage.objects FOR SELECT USING (bucket_id = 'gallery');
CREATE POLICY "Auth upload gallery"  ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'gallery' AND public.owns_business_folder((storage.foldername(name))[1]));
CREATE POLICY "Auth update gallery"  ON storage.objects FOR UPDATE USING   (bucket_id = 'gallery' AND public.owns_business_folder((storage.foldername(name))[1]));
CREATE POLICY "Auth delete gallery"  ON storage.objects FOR DELETE USING   (bucket_id = 'gallery' AND public.owns_business_folder((storage.foldername(name))[1]));

-- event-images
CREATE POLICY "Public read event-images"  ON storage.objects FOR SELECT USING (bucket_id = 'event-images');
CREATE POLICY "Auth upload event-images"  ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'event-images' AND public.owns_business_folder((storage.foldername(name))[1]));
CREATE POLICY "Auth update event-images"  ON storage.objects FOR UPDATE USING   (bucket_id = 'event-images' AND public.owns_business_folder((storage.foldername(name))[1]));
CREATE POLICY "Auth delete event-images"  ON storage.objects FOR DELETE USING   (bucket_id = 'event-images' AND public.owns_business_folder((storage.foldername(name))[1]));

-- accommodation-images
CREATE POLICY "Public read accommodation-images"  ON storage.objects FOR SELECT USING (bucket_id = 'accommodation-images');
CREATE POLICY "Auth upload accommodation-images"  ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'accommodation-images' AND public.owns_business_folder((storage.foldername(name))[1]));
CREATE POLICY "Auth update accommodation-images"  ON storage.objects FOR UPDATE USING   (bucket_id = 'accommodation-images' AND public.owns_business_folder((storage.foldername(name))[1]));
CREATE POLICY "Auth delete accommodation-images"  ON storage.objects FOR DELETE USING   (bucket_id = 'accommodation-images' AND public.owns_business_folder((storage.foldername(name))[1]));

-- experience-images
CREATE POLICY "Public read experience-images"  ON storage.objects FOR SELECT USING (bucket_id = 'experience-images');
CREATE POLICY "Auth upload experience-images"  ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'experience-images' AND public.owns_business_folder((storage.foldername(name))[1]));
CREATE POLICY "Auth update experience-images"  ON storage.objects FOR UPDATE USING   (bucket_id = 'experience-images' AND public.owns_business_folder((storage.foldername(name))[1]));
CREATE POLICY "Auth delete experience-images"  ON storage.objects FOR DELETE USING   (bucket_id = 'experience-images' AND public.owns_business_folder((storage.foldername(name))[1]));

-- news-images
CREATE POLICY "Public read news-images"  ON storage.objects FOR SELECT USING (bucket_id = 'news-images');
CREATE POLICY "Auth upload news-images"  ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'news-images' AND public.owns_business_folder((storage.foldername(name))[1]));
CREATE POLICY "Auth update news-images"  ON storage.objects FOR UPDATE USING   (bucket_id = 'news-images' AND public.owns_business_folder((storage.foldername(name))[1]));
CREATE POLICY "Auth delete news-images"  ON storage.objects FOR DELETE USING   (bucket_id = 'news-images' AND public.owns_business_folder((storage.foldername(name))[1]));

-- menu-pdfs
CREATE POLICY "Public read menu-pdfs"  ON storage.objects FOR SELECT USING (bucket_id = 'menu-pdfs');
CREATE POLICY "Auth upload menu-pdfs"  ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'menu-pdfs' AND public.owns_business_folder((storage.foldername(name))[1]));
CREATE POLICY "Auth update menu-pdfs"  ON storage.objects FOR UPDATE USING   (bucket_id = 'menu-pdfs' AND public.owns_business_folder((storage.foldername(name))[1]));
CREATE POLICY "Auth delete menu-pdfs"  ON storage.objects FOR DELETE USING   (bucket_id = 'menu-pdfs' AND public.owns_business_folder((storage.foldername(name))[1]));
