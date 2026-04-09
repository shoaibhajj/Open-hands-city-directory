import type { Metadata } from 'next';
import { Inter, Noto_Sans_Arabic } from 'next/font/google';
import '@/styles/globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const notoSansArabic = Noto_Sans_Arabic({
  subsets: ['arabic'],
  variable: '--font-noto-arabic',
});

export const metadata: Metadata = {
  title: 'دليل النبك - Daleel Al-Nabk',
  description: 'دليل شركات وأعمال مدينة النبك في سوريا',
  keywords: ['دليل النبك', 'أعمال النبك', ' Syrian business directory', 'Al Nabk'],
  authors: [{ name: 'Daleel Al-Nabk' }],
  openGraph: {
    title: 'دليل النبك - Daleel Al-Nabk',
    description: 'دليل شركات وأعمال مدينة النبك في سوريا',
    type: 'website',
    locale: 'ar_SY',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${inter.variable} ${notoSansArabic.variable} font-arabic antialiased`}>
        {children}
      </body>
    </html>
  );
}