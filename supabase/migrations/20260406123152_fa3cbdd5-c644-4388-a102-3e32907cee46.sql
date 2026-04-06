
-- 1. Create security definer function
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

-- 2. Drop and recreate public SELECT policies on all child tables

-- sections
DROP POLICY IF EXISTS "Public can read enabled sections" ON public.sections;
CREATE POLICY "Public can read enabled sections" ON public.sections
  FOR SELECT USING (public.is_published_business(business_id));

-- services
DROP POLICY IF EXISTS "Public read services" ON public.services;
CREATE POLICY "Public read services" ON public.services
  FOR SELECT USING (public.is_published_business(business_id));

-- gallery_images
DROP POLICY IF EXISTS "Public read gallery" ON public.gallery_images;
CREATE POLICY "Public read gallery" ON public.gallery_images
  FOR SELECT USING (public.is_published_business(business_id));

-- menu
DROP POLICY IF EXISTS "Public read menu" ON public.menu;
CREATE POLICY "Public read menu" ON public.menu
  FOR SELECT USING (public.is_published_business(business_id));

-- events
DROP POLICY IF EXISTS "Public read events" ON public.events;
CREATE POLICY "Public read events" ON public.events
  FOR SELECT USING (public.is_published_business(business_id));

-- accommodations
DROP POLICY IF EXISTS "Public read accommodations" ON public.accommodations;
CREATE POLICY "Public read accommodations" ON public.accommodations
  FOR SELECT USING (public.is_published_business(business_id));

-- experiences
DROP POLICY IF EXISTS "Public read experiences" ON public.experiences;
CREATE POLICY "Public read experiences" ON public.experiences
  FOR SELECT USING (public.is_published_business(business_id));

-- testimonials
DROP POLICY IF EXISTS "Public read testimonials" ON public.testimonials;
CREATE POLICY "Public read testimonials" ON public.testimonials
  FOR SELECT USING (public.is_published_business(business_id));

-- news
DROP POLICY IF EXISTS "Public read news" ON public.news;
CREATE POLICY "Public read news" ON public.news
  FOR SELECT USING (public.is_published_business(business_id));

-- faq
DROP POLICY IF EXISTS "Public can read faq" ON public.faq;
CREATE POLICY "Public can read faq" ON public.faq
  FOR SELECT USING (public.is_published_business(business_id));

-- 3. Remove the broad public SELECT policy from businesses
DROP POLICY IF EXISTS "Public can read published businesses" ON public.businesses;
