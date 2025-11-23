"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
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

const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Transactions", href: "/transactions", icon: Receipt },
    { name: "Statistiques", href: "/stats", icon: BarChart3 },
    { name: "Budgets", href: "/budgets", icon: Wallet },
    { name: "Objectifs", href: "/goals", icon: Target },
    { name: "Récurrentes", href: "/recurrings", icon: Repeat },
    { name: "Paramètres", href: "/settings", icon: Settings },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    return (
        <div className="flex h-screen bg-background">
            {/* Sidebar */}
            <aside className="w-64 border-r border-border bg-card">
                <div className="flex h-full flex-col">
                    {/* Logo */}
                    <div className="flex h-16 items-center border-b border-border px-6">
                        <Link href="/dashboard" className="flex items-center space-x-2">
                            <div className="text-2xl font-bold text-primary">مصروف</div>
                        </Link>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 space-y-1 px-3 py-4">
                        {navigation.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
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

                    {/* User Profile */}
                    <div className="border-t border-border p-4">
                        <div className="flex items-center space-x-3">
                            <UserButton afterSignOutUrl="/" />
                            <div className="flex-1">
                                <p className="text-sm font-medium">Mon Compte</p>
                            </div>
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
