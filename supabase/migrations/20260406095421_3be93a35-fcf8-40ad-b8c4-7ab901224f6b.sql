-- Remove the overly broad public SELECT policy from the businesses table.
-- Public reads are handled by the businesses_public view which excludes owner_id.
DROP POLICY IF EXISTS "Public can read published businesses" ON public.businesses;