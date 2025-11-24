"use client";

import { Link, usePathname } from "@/lib/navigation";
import { UserButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { useTranslations } from "next-intl";
import {
    LayoutDashboard,
    Receipt,
    BarChart3,
    Wallet,
    Target,
    Repeat,
    Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LanguageSwitcher } from "@/components/settings/LanguageSwitcher";

export function AppLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const t = useTranslations("nav");
    const tSettings = useTranslations("settings");

    const navigation = [
        { name: t("dashboard"), href: "/dashboard", icon: LayoutDashboard },
        { name: t("transactions"), href: "/transactions", icon: Receipt },
        { name: t("stats"), href: "/stats", icon: BarChart3 },
        { name: t("budgets"), href: "/budgets", icon: Wallet },
        { name: t("goals"), href: "/goals", icon: Target },
        { name: t("recurrings"), href: "/recurrings", icon: Repeat },
        { name: t("settings"), href: "/settings", icon: Settings },
    ];

    return (
        <div className="flex h-screen bg-background">
            {/* Sidebar */}
            <aside className="w-64 border-r border-border bg-card hidden md:block">
                <div className="flex h-full flex-col">
                    {/* Logo */}
                    <div className="flex h-16 items-center justify-between border-b border-border px-6">
                        <Link href="/dashboard" className="flex items-center gap-2">
                            <div className="text-2xl font-bold text-primary">مصروف</div>
                        </Link>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 space-y-1 px-3 py-4">
                        {navigation.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                        isActive
                                            ? "bg-primary text-primary-foreground"
                                            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                    )}
                                >
                                    <item.icon className="h-5 w-5" />
                                    <span>{item.name}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User Profile & Language */}
                    <div className="border-t border-border p-4 space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div suppressHydrationWarning>
                                    <SignedIn>
                                        <UserButton afterSignOutUrl="/" />
                                    </SignedIn>
                                    <SignedOut>
                                        <div className="h-8 w-8 rounded-full bg-muted" />
                                    </SignedOut>
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium">{tSettings("profile")}</p>
                                </div>
                            </div>
                            <LanguageSwitcher />
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <div className="container mx-auto p-8">{children}</div>
            </main>
        </div>
    );
}
