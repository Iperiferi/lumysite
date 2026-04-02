-- =============================================
-- 1. Remove broad storage policies (24 total)
-- =============================================

-- DELETE policies (8 buckets)
DROP POLICY IF EXISTS "Authenticated users can delete accommodation-images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete event-images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete experience-images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete gallery" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete hero-images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete logos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete menu-pdfs" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete news-images" ON storage.objects;

-- UPDATE policies (8 buckets)
DROP POLICY IF EXISTS "Authenticated users can update accommodation-images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update event-images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update experience-images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update gallery" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update hero-images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update logos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update menu-pdfs" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update news-images" ON storage.objects;

-- INSERT policies (8 buckets)
DROP POLICY IF EXISTS "Authenticated users can upload accommodation-images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload event-images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload experience-images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload gallery" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload hero-images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload logos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload menu-pdfs" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload news-images" ON storage.objects;

-- =============================================
-- 2. Create public view for businesses (no owner_id)
-- =============================================

CREATE OR REPLACE VIEW public.businesses_public
WITH (security_invoker = on) AS
SELECT
  id, subdomain, business_name, short_description, about_text,
  address, phone, email, google_maps_embed,
  accent_color, font_style, logo_url, hero_image_url,
  is_published, opening_hours, cta_text, hero_focal_point,
  facebook_url, instagram_url, tiktok_url, youtube_url, linkedin_url,
  created_at, updated_at
FROM public.businesses;