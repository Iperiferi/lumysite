
-- Focal point columns
ALTER TABLE public.businesses ADD COLUMN hero_focal_point text DEFAULT '50% 50%';
ALTER TABLE public.gallery_images ADD COLUMN focal_point text DEFAULT '50% 50%';
ALTER TABLE public.events ADD COLUMN focal_point text DEFAULT '50% 50%';
ALTER TABLE public.accommodations ADD COLUMN focal_point text DEFAULT '50% 50%';
ALTER TABLE public.experiences ADD COLUMN focal_point text DEFAULT '50% 50%';
ALTER TABLE public.news ADD COLUMN focal_point text DEFAULT '50% 50%';

-- Social media URL columns
ALTER TABLE public.businesses ADD COLUMN facebook_url text;
ALTER TABLE public.businesses ADD COLUMN instagram_url text;
ALTER TABLE public.businesses ADD COLUMN tiktok_url text;
ALTER TABLE public.businesses ADD COLUMN youtube_url text;
ALTER TABLE public.businesses ADD COLUMN linkedin_url text;
