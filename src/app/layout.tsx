import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'LumySite — Skapa din sida på nätet på minuter',
  description: 'LumySite ger ditt företag en professionell sida på nätet. Ingen kod. Mobilanpassad. Flerspråkig. Prova gratis i 7 dagar.',
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
