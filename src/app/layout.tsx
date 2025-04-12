import type {Metadata} from 'next';
import {Geist, Geist_Mono} from 'next/font/google';
import {Kanit} from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const kanit = Kanit({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-kanit',
});

export const metadata: Metadata = {
  title: 'HarvestAI',
  description: 'Análisis de Madurez de Cannabis con IA',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${geistSans.variable} ${geistMono.variable} ${kanit.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
