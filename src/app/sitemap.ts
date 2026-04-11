import { createClient } from '@supabase/supabase-js';
import type { MetadataRoute } from 'next';

export const dynamic = 'force-dynamic';

const SUPABASE_URL = 'https://rceyevpxtwyiunybomye.supabase.co';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient(
    SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

  const { data: businesses } = await supabase
    .from('businesses')
    .select('subdomain, updated_at')
    .eq('is_published', true);

  const businessUrls: MetadataRoute.Sitemap = (businesses || []).map((b) => ({
    url: `https://lumysite.com/${b.subdomain}`,
    lastModified: b.updated_at ? new Date(b.updated_at) : new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [
    {
      url: 'https://lumysite.com',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
    ...businessUrls,
  ];
}
