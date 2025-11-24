import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { ConvexClientProvider } from "@/components/providers/ConvexClientProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";
import { NextIntlClientProvider } from 'next-intl';
import type { AbstractIntlMessages } from 'next-intl';
import "../globals.css";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
});

export const metadata: Metadata = {
    title: "Masrouf - Gestion des Finances Personnelles",
    description: "Application de gestion des finances personnelles moderne et intuitive",
};

export default async function LocaleLayout({
    children,
    params
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    const messages = (await import(`../../messages/${locale}.json`)).default as AbstractIntlMessages;

    return (
        <ClerkProvider>
            <div lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'} className={`${inter.variable} font-sans antialiased`}>
                <NextIntlClientProvider key={locale} locale={locale} messages={messages}>
                    <ConvexClientProvider>
                        <ThemeProvider
                            attribute="class"
                            defaultTheme="dark"
                            enableSystem
                            disableTransitionOnChange
                        >
                            {children}
                            <Toaster />
                        </ThemeProvider>
                    </ConvexClientProvider>
                </NextIntlClientProvider>
            </div>
        </ClerkProvider>
    );
}
