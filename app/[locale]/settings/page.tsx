"use client";

import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useUser, useClerk, SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { CategoryManager } from "@/components/settings/CategoryManager";
import { ThemeToggle } from "@/components/settings/ThemeToggle";
import { DataSeeder } from "@/components/settings/DataSeeder";
import { DataExportButton } from "@/components/settings/DataExportButton";
import { Moon, Sun, LogOut, User, Target, Wallet, Database } from "lucide-react";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";

export default function SettingsPage() {
    const tCommon = useTranslations("common");
    return (
        <AppLayout>
            <SignedIn>
                <SettingsContent />
            </SignedIn>
            <SignedOut>
                <div className="flex min-h-[50vh] items-center justify-center">
                    <SignInButton mode="modal">
                        <Button size="lg" className="shadow-lg hover:shadow-primary/25">{tCommon("signIn")}</Button>
                    </SignInButton>
                </div>
            </SignedOut>
        </AppLayout>
    );
}

function SettingsContent() {
    const t = useTranslations("settings");
    const tCommon = useTranslations("common");
    const { user } = useUser();
    const { signOut } = useClerk();
    const { theme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">{t("title")}</h1>
                <p className="text-muted-foreground mt-1">
                    {t("subtitle")}
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Profile Section */}
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-sm md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl">
                            <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                <User className="h-5 w-5" />
                            </div>
                            {t("profile")}
                        </CardTitle>
                        <CardDescription>
                            {t("profileDesc")}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-4 rounded-xl border border-border/50 bg-background/50">
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <img
                                        src={user?.imageUrl}
                                        alt="Profile"
                                        className="h-16 w-16 rounded-full ring-2 ring-background shadow-md"
                                    />
                                    <div className="absolute bottom-0 right-0 h-4 w-4 rounded-full bg-green-500 ring-2 ring-background" />
                                </div>
                                <div className="text-center sm:text-left">
                                    <p className="font-bold text-lg">
                                        {user?.fullName || user?.username}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {user?.primaryEmailAddress?.emailAddress}
                                    </p>
                                </div>
                            </div>
                            <Button variant="destructive" onClick={() => signOut()} className="shadow-lg shadow-destructive/20 hover:shadow-destructive/40 transition-all">
                                <LogOut className="me-2 h-4 w-4" />
                                {t("logout")}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Appearance Section */}
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <div className="p-2 rounded-lg bg-orange-500/10 text-orange-500">
                                {theme === "dark" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                            </div>
                            {t("appearance")}
                        </CardTitle>
                        <CardDescription>
                            {t("appearanceDesc")}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-background/50">
                            <div className="space-y-0.5">
                                <Label className="text-base">{t("themeLabel")}</Label>
                                <p className="text-xs text-muted-foreground">
                                    {t("themeDesc")}
                                </p>
                            </div>
                            <ThemeToggle />
                        </div>
                    </CardContent>
                </Card>

                {/* Data Section */}
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <div className="p-2 rounded-lg bg-green-500/10 text-green-500">
                                <Database className="h-5 w-5" />
                            </div>
                            {t("data")}
                        </CardTitle>
                        <CardDescription>
                            {t("dataDesc")}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <DataExportButton />
                        <DataSeeder />
                    </CardContent>
                </Card>

                {/* Categories Section */}
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-sm md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <div className="p-2 rounded-lg bg-violet-500/10 text-violet-500">
                                <Target className="h-5 w-5" />
                            </div>
                            {t("categories")}
                        </CardTitle>
                        <CardDescription>
                            {t("categoriesDesc")}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <CategoryManager />
                    </CardContent>
                </Card>

                {/* About Section */}
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-sm md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                                <Wallet className="h-5 w-5" />
                            </div>
                            {t("about")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-sm text-muted-foreground space-y-2 p-4 rounded-xl border border-border/50 bg-background/50">
                            <p className="font-medium text-foreground">{t("version")}</p>
                            <p>{t("madeWithLove")}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
