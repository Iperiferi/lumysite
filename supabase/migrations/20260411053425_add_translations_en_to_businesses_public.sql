-- Add translations_en to businesses_public view so the public site can use EN translations
DROP VIEW IF EXISTS public.businesses_public;
CREATE VIEW public.businesses_public AS
SELECT id, subdomain, business_name, short_description, about_text,
       address, phone, email, google_maps_embed, accent_color, font_style,
       logo_url, hero_image_url, is_published, opening_hours, cta_text,
       hero_focal_point, facebook_url, instagram_url, tiktok_url,
       youtube_url, linkedin_url, created_at, updated_at,
       translations_en
FROM businesses
WHERE is_published = true;
