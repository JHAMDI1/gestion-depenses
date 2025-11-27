import { Metadata } from "next";

interface PageMetadata {
    titleFr: string;
    titleAr: string;
    descriptionFr: string;
    descriptionAr: string;
}

const pageMetadata: Record<string, PageMetadata> = {
    dashboard: {
        titleFr: "Tableau de bord - Masrouf",
        titleAr: "لوحة التحكم - مصروف",
        descriptionFr: "Suivez vos dépenses mensuelles et gérez votre budget personnel avec Masrouf.",
        descriptionAr: "تتبع نفقاتك الشهرية وإدارة ميزانيتك الشخصية مع مصروف.",
    },
    transactions: {
        titleFr: "Transactions - Masrouf",
        titleAr: "المعاملات - مصروف",
        descriptionFr: "Gérez toutes vos transactions financières : revenus et dépenses.",
        descriptionAr: "إدارة جميع معاملاتك المالية: الإيرادات والنفقات.",
    },
    stats: {
        titleFr: "Statistiques - Masrouf",
        titleAr: "الإحصائيات - مصروف",
        descriptionFr: "Analysez vos habitudes de dépenses avec des graphiques détaillés.",
        descriptionAr: "تحليل عادات الإنفاق الخاصة بك مع رسوم بيانية مفصلة.",
    },
    budgets: {
        titleFr: "Budgets - Masrouf",
        titleAr: "الميزانيات - مصروف",
        descriptionFr: "Définissez et suivez vos budgets mensuels par catégorie.",
        descriptionAr: "حدد وتتبع ميزانياتك الشهرية حسب الفئة.",
    },
    goals: {
        titleFr: "Objectifs d'épargne - Masrouf",
        titleAr: "أهداف الادخار - مصروف",
        descriptionFr: "Créez et atteignez vos objectifs d'épargne pour vos projets futurs.",
        descriptionAr: "إنشاء وتحقيق أهداف الادخار الخاصة بك لمشاريعك المستقبلية.",
    },
    recurrings: {
        titleFr: "Transactions récurrentes - Masrouf",
        titleAr: "المعاملات المتكررة - مصروف",
        descriptionFr: "Gérez vos abonnements et factures récurrentes automatiquement.",
        descriptionAr: "إدارة اشتراكاتك وفواتيرك المتكررة تلقائيًا.",
    },
    debts: {
        titleFr: "Dettes - Masrouf",
        titleAr: "الديون - مصروف",
        descriptionFr: "Suivez vos prêts et emprunts en toute simplicité.",
        descriptionAr: "تتبع قروضك واستداناتك بكل بساطة.",
    },
    settings: {
        titleFr: "Paramètres - Masrouf",
        titleAr: "الإعدادات - مصروف",
        descriptionFr: "Personnalisez votre expérience et gérez vos préférences.",
        descriptionAr: "تخصيص تجربتك وإدارة تفضيلاتك.",
    },
};

export function generateMetadata(page: string, locale: string): Metadata {
    const meta = pageMetadata[page];
    if (!meta) {
        return {
            title: "Masrouf - Gestion financière personnelle",
            description: "Gérez vos finances personnelles avec Masrouf",
        };
    }

    const title = locale === "ar" ? meta.titleAr : meta.titleFr;
    const description = locale === "ar" ? meta.descriptionAr : meta.descriptionFr;

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            type: "website",
            locale: locale === "ar" ? "ar_TN" : "fr_FR",
            siteName: "Masrouf",
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
        },
    };
}
