
-- Gallery bucket policies
CREATE POLICY "Authenticated users can upload gallery" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'gallery');
CREATE POLICY "Authenticated users can delete gallery" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'gallery');
CREATE POLICY "Public can read gallery" ON storage.objects FOR SELECT TO public USING (bucket_id = 'gallery');

-- Event images
CREATE POLICY "Authenticated users can upload event-images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'event-images');
CREATE POLICY "Authenticated users can delete event-images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'event-images');
CREATE POLICY "Public can read event-images" ON storage.objects FOR SELECT TO public USING (bucket_id = 'event-images');

-- Accommodation images
CREATE POLICY "Authenticated users can upload accommodation-images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'accommodation-images');
CREATE POLICY "Authenticated users can delete accommodation-images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'accommodation-images');
CREATE POLICY "Public can read accommodation-images" ON storage.objects FOR SELECT TO public USING (bucket_id = 'accommodation-images');

-- Experience images
CREATE POLICY "Authenticated users can upload experience-images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'experience-images');
CREATE POLICY "Authenticated users can delete experience-images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'experience-images');
CREATE POLICY "Public can read experience-images" ON storage.objects FOR SELECT TO public USING (bucket_id = 'experience-images');

-- News images
CREATE POLICY "Authenticated users can upload news-images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'news-images');
CREATE POLICY "Authenticated users can delete news-images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'news-images');
CREATE POLICY "Public can read news-images" ON storage.objects FOR SELECT TO public USING (bucket_id = 'news-images');

-- Menu PDFs
CREATE POLICY "Authenticated users can upload menu-pdfs" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'menu-pdfs');
CREATE POLICY "Authenticated users can delete menu-pdfs" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'menu-pdfs');
CREATE POLICY "Public can read menu-pdfs" ON storage.objects FOR SELECT TO public USING (bucket_id = 'menu-pdfs');

-- Logos
CREATE POLICY "Authenticated users can upload logos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'logos');
CREATE POLICY "Authenticated users can delete logos" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'logos');
CREATE POLICY "Public can read logos" ON storage.objects FOR SELECT TO public USING (bucket_id = 'logos');

-- Hero images
CREATE POLICY "Authenticated users can upload hero-images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'hero-images');
CREATE POLICY "Authenticated users can delete hero-images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'hero-images');
CREATE POLICY "Public can read hero-images" ON storage.objects FOR SELECT TO public USING (bucket_id = 'hero-images');

-- Update policies for all buckets
CREATE POLICY "Authenticated users can update gallery" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'gallery');
CREATE POLICY "Authenticated users can update event-images" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'event-images');
CREATE POLICY "Authenticated users can update accommodation-images" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'accommodation-images');
CREATE POLICY "Authenticated users can update experience-images" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'experience-images');
CREATE POLICY "Authenticated users can update news-images" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'news-images');
CREATE POLICY "Authenticated users can update menu-pdfs" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'menu-pdfs');
CREATE POLICY "Authenticated users can update logos" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'logos');
CREATE POLICY "Authenticated users can update hero-images" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'hero-images');
