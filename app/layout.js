import './globals.css';
import { JetBrains_Mono, Inter } from 'next/font/google';

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata = {
  title: 'Bloomberg Terminal — Replica',
  description: 'A pixel-accurate, fully functional Bloomberg Terminal clone built with Next.js.',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#000000',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${jetbrains.variable} ${inter.variable}`}>
      <body className="scanlines">{children}</body>
    </html>
  );
}
