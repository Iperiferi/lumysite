CREATE POLICY "Public can read published businesses"
ON public.businesses FOR SELECT
TO public
USING (is_published = true);