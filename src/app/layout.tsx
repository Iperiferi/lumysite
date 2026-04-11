import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'LumySite',
  description: 'LumySite ger ditt företag en professionell sida på nätet. Ingen kod. Mobilanpassad. Svenska och engelska. Prova gratis i 7 dagar.',
  verification: {
    google: 'googlefa49b31676739750',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sv" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
