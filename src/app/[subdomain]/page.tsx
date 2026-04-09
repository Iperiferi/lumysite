import PublicSiteClient from './PublicSiteClient';

export default async function PublicSitePage({
  params,
}: {
  params: Promise<{ subdomain: string }>;
}) {
  const { subdomain } = await params;
  return <PublicSiteClient subdomain={subdomain} />;
}
