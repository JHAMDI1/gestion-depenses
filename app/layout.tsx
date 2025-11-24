import { Inter } from "next/font/google";
import { getLocale } from 'next-intl/server';

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter"
});

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  return (
    <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'} suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>{children}</body>
    </html>
  );
}
