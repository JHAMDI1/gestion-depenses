import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { ConvexClientProvider } from "@/components/providers/ConvexClientProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";
import { InstallPWA } from "@/components/pwa/InstallPWA";
import { NextIntlClientProvider } from 'next-intl';
import type { AbstractIntlMessages } from 'next-intl';
import "../globals.css";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
});

export const metadata: Metadata = {
    title: {
        template: "%s | Masrouf",
        default: "Masrouf - Gestion des Finances Personnelles",
    },
    description: "Prenez le contrôle de vos finances avec Masrouf. Suivez vos dépenses, gérez vos budgets et atteignez vos objectifs d'épargne.",
    applicationName: "Masrouf",
    authors: [{ name: "Masrouf Team" }],
    keywords: ["finance", "budget", "dépenses", "épargne", "masrouf", "gestion"],
    openGraph: {
        type: "website",
        locale: "fr_FR",
        url: "https://masrouf.app",
        siteName: "Masrouf",
        images: [
            {
                url: "/og-image.png",
                width: 1200,
                height: 630,
                alt: "Masrouf App",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "Masrouf - Gestion des Finances Personnelles",
        description: "Prenez le contrôle de vos finances avec Masrouf.",
        images: ["/og-image.png"],
    },
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
                            <Toaster richColors />
                            <InstallPWA />
                        </ThemeProvider>
                    </ConvexClientProvider>
                </NextIntlClientProvider>
                <script dangerouslySetInnerHTML={{
                    __html: `
                        if ('serviceWorker' in navigator) {
                            window.addEventListener('load', () => {
                                navigator.serviceWorker.register('/sw.js')
                                    .then(reg => console.log('SW registered:', reg))
                                    .catch(err => console.log('SW registration failed:', err));
                            });
                        }
                    `
                }} />
            </div>
        </ClerkProvider>
    );
}
