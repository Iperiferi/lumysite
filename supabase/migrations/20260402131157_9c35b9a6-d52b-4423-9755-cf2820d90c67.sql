-- Create a security definer function to check business folder ownership
CREATE OR REPLACE FUNCTION public.owns_business_folder(folder_name text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.businesses
    WHERE id::text = folder_name
      AND owner_id = auth.uid()
  )
$$;

-- Drop old scoped policies for business-id-based buckets and recreate with ownership check
-- Gallery
DROP POLICY IF EXISTS "Auth upload gallery" ON storage.objects;
DROP POLICY IF EXISTS "Auth update gallery" ON storage.objects;
DROP POLICY IF EXISTS "Auth delete gallery" ON storage.objects;

CREATE POLICY "Auth upload gallery" ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'gallery' AND public.owns_business_folder((storage.foldername(name))[1]));

CREATE POLICY "Auth update gallery" ON storage.objects FOR UPDATE
USING (bucket_id = 'gallery' AND public.owns_business_folder((storage.foldername(name))[1]));

CREATE POLICY "Auth delete gallery" ON storage.objects FOR DELETE
USING (bucket_id = 'gallery' AND public.owns_business_folder((storage.foldername(name))[1]));

-- Event images
DROP POLICY IF EXISTS "Auth upload event-images" ON storage.objects;
DROP POLICY IF EXISTS "Auth update event-images" ON storage.objects;
DROP POLICY IF EXISTS "Auth delete event-images" ON storage.objects;

CREATE POLICY "Auth upload event-images" ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'event-images' AND public.owns_business_folder((storage.foldername(name))[1]));

CREATE POLICY "Auth update event-images" ON storage.objects FOR UPDATE
USING (bucket_id = 'event-images' AND public.owns_business_folder((storage.foldername(name))[1]));

CREATE POLICY "Auth delete event-images" ON storage.objects FOR DELETE
USING (bucket_id = 'event-images' AND public.owns_business_folder((storage.foldername(name))[1]));

-- Menu PDFs
DROP POLICY IF EXISTS "Auth upload menu-pdfs" ON storage.objects;
DROP POLICY IF EXISTS "Auth update menu-pdfs" ON storage.objects;
DROP POLICY IF EXISTS "Auth delete menu-pdfs" ON storage.objects;

CREATE POLICY "Auth upload menu-pdfs" ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'menu-pdfs' AND public.owns_business_folder((storage.foldername(name))[1]));

CREATE POLICY "Auth update menu-pdfs" ON storage.objects FOR UPDATE
USING (bucket_id = 'menu-pdfs' AND public.owns_business_folder((storage.foldername(name))[1]));

CREATE POLICY "Auth delete menu-pdfs" ON storage.objects FOR DELETE
USING (bucket_id = 'menu-pdfs' AND public.owns_business_folder((storage.foldername(name))[1]));

-- Accommodation images
DROP POLICY IF EXISTS "Auth upload accommodation-images" ON storage.objects;
DROP POLICY IF EXISTS "Auth update accommodation-images" ON storage.objects;
DROP POLICY IF EXISTS "Auth delete accommodation-images" ON storage.objects;

CREATE POLICY "Auth upload accommodation-images" ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'accommodation-images' AND public.owns_business_folder((storage.foldername(name))[1]));

CREATE POLICY "Auth update accommodation-images" ON storage.objects FOR UPDATE
USING (bucket_id = 'accommodation-images' AND public.owns_business_folder((storage.foldername(name))[1]));

CREATE POLICY "Auth delete accommodation-images" ON storage.objects FOR DELETE
USING (bucket_id = 'accommodation-images' AND public.owns_business_folder((storage.foldername(name))[1]));

-- Experience images
DROP POLICY IF EXISTS "Auth upload experience-images" ON storage.objects;
DROP POLICY IF EXISTS "Auth update experience-images" ON storage.objects;
DROP POLICY IF EXISTS "Auth delete experience-images" ON storage.objects;

CREATE POLICY "Auth upload experience-images" ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'experience-images' AND public.owns_business_folder((storage.foldername(name))[1]));

CREATE POLICY "Auth update experience-images" ON storage.objects FOR UPDATE
USING (bucket_id = 'experience-images' AND public.owns_business_folder((storage.foldername(name))[1]));

CREATE POLICY "Auth delete experience-images" ON storage.objects FOR DELETE
USING (bucket_id = 'experience-images' AND public.owns_business_folder((storage.foldername(name))[1]));

-- News images
DROP POLICY IF EXISTS "Auth upload news-images" ON storage.objects;
DROP POLICY IF EXISTS "Auth update news-images" ON storage.objects;
DROP POLICY IF EXISTS "Auth delete news-images" ON storage.objects;

CREATE POLICY "Auth upload news-images" ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'news-images' AND public.owns_business_folder((storage.foldername(name))[1]));

CREATE POLICY "Auth update news-images" ON storage.objects FOR UPDATE
USING (bucket_id = 'news-images' AND public.owns_business_folder((storage.foldername(name))[1]));

CREATE POLICY "Auth delete news-images" ON storage.objects FOR DELETE
USING (bucket_id = 'news-images' AND public.owns_business_folder((storage.foldername(name))[1]));