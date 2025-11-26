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
    Handshake,
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
        { name: t("debts"), href: "/debts", icon: Handshake },
        { name: t("settings"), href: "/settings", icon: Settings },
    ];

    return (
        <div className="flex h-screen bg-background">
            {/* Sidebar */}
            <aside className="w-64 hidden md:flex flex-col border-r border-border/50 bg-card/50 backdrop-blur-xl">
                <div className="flex h-full flex-col">
                    {/* Logo */}
                    <div className="flex h-16 items-center justify-between border-b border-border/50 px-6">
                        <Link href="/dashboard" className="flex items-center gap-2 group">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-violet-600 text-white shadow-lg shadow-primary/25 transition-transform duration-300 group-hover:scale-110">
                                <Wallet className="h-5 w-5" />
                            </div>
                            <div className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                                Masrouf
                            </div>
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
                                        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ease-out group relative overflow-hidden",
                                        isActive
                                            ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                                            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                    )}
                                >
                                    <item.icon className={cn("h-5 w-5 transition-transform duration-200", isActive ? "scale-110" : "group-hover:scale-110")} />
                                    <span>{item.name}</span>
                                    {isActive && (
                                        <div className="absolute right-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-l-full bg-white/20" />
                                    )}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User Profile & Language */}
                    <div className="border-t border-border/50 p-4 space-y-4 bg-background/50">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div suppressHydrationWarning>
                                    <SignedIn>
                                        <UserButton afterSignOutUrl="/" appearance={{
                                            elements: {
                                                avatarBox: "h-9 w-9 ring-2 ring-background shadow-sm"
                                            }
                                        }} />
                                    </SignedIn>
                                    <SignedOut>
                                        <div className="h-9 w-9 rounded-full bg-muted animate-pulse" />
                                    </SignedOut>
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <p className="text-sm font-medium truncate">{tSettings("profile")}</p>
                                    <p className="text-xs text-muted-foreground truncate">Manage account</p>
                                </div>
                            </div>
                            <LanguageSwitcher />
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto bg-background/50">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-8 max-w-7xl">
                    {children}
                </div>
            </main>

            {/* Mobile Bottom Navigation */}
            <nav className="md:hidden fixed inset-x-0 bottom-0 z-50 border-t border-border/50 bg-card/80 backdrop-blur-xl pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
                <div className="flex items-stretch justify-between gap-1 px-2 py-2">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={`mobile-${item.href}`}
                                href={item.href}
                                aria-label={item.name}
                                className={cn(
                                    "flex flex-1 flex-col items-center justify-center gap-1 rounded-xl p-2 text-[10px] font-medium transition-all duration-200 ease-out",
                                    isActive
                                        ? "text-primary bg-primary/10"
                                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                )}
                            >
                                <item.icon className={cn("h-5 w-5 transition-transform duration-200", isActive && "-translate-y-0.5 scale-110")} />
                                <span className={cn("leading-none transition-all duration-200", isActive && "font-bold")}>{item.name}</span>
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </div>
    );
}
