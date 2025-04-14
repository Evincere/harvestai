import type {Metadata} from 'next';
import './globals.css';
import './fonts.css';

// Definimos variables para las fuentes con valores por defecto
const geistSans = { variable: '--font-geist-sans' };
const geistMono = { variable: '--font-geist-mono' };
const kanit = { variable: '--font-kanit' };

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

