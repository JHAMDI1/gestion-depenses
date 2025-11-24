"use client";

import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { UserProfile, useUser, useClerk } from "@clerk/nextjs";
import { CategoryManager } from "@/components/settings/CategoryManager";
import { ThemeToggle } from "@/components/settings/ThemeToggle";
import { DataSeeder } from "@/components/settings/DataSeeder";
import { Moon, Sun, LogOut, User } from "lucide-react";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";

export default function SettingsPage() {
    const t = useTranslations("settings");
    const tCommon = useTranslations("common");
    const { user } = useUser();
    const { signOut } = useClerk();
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Avoid hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <AppLayout>
            <div className="space-y-8">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold">{t("title")}</h1>
                    <p className="text-muted-foreground">
                        {t("subtitle")}
                    </p>
                </div>

                <div className="grid gap-6">
                    {/* Profile Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                {t("profile")}
                            </CardTitle>
                            <CardDescription>
                                {t("profileDesc")}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-4">
                                <img
                                    src={user?.imageUrl}
                                    alt="Profile"
                                    className="h-16 w-16 rounded-full"
                                />
                                <div>
                                    <p className="font-medium text-lg">
                                        {user?.fullName || user?.username}
                                    </p>
                                    <p className="text-muted-foreground">
                                        {user?.primaryEmailAddress?.emailAddress}
                                    </p>
                                </div>
                            </div>
                            <Button variant="outline" onClick={() => signOut()} className="text-destructive">
                                <LogOut className="me-2 h-4 w-4" />
                                {t("logout")}
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Appearance Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                {theme === "dark" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                                {t("appearance")}
                            </CardTitle>
                            <CardDescription>
                                {t("appearanceDesc")}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>{t("themeLabel")}</Label>
                                    <p className="text-sm text-muted-foreground">
                                        {t("themeDesc")}
                                    </p>
                                </div>
                                <ThemeToggle />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Categories Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle>{t("categories")}</CardTitle>
                            <CardDescription>
                                {t("categoriesDesc")}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <CategoryManager />
                        </CardContent>
                    </Card>

                    {/* Data Section */}
                    <DataSeeder />

                    {/* About Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle>{t("about")}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm text-muted-foreground space-y-2">
                                <p>{t("version")}</p>
                                <p>{t("madeWithLove")}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
