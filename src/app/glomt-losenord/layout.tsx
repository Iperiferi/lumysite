import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'LumySite — Glömt lösenord',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
