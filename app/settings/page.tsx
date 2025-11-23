"use client";

import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { UserProfile, useUser, useClerk } from "@clerk/nextjs";
import { CategoryManager } from "@/components/settings/CategoryManager";
import { ThemeToggle } from "@/components/settings/ThemeToggle";
import { Moon, Sun, LogOut, User } from "lucide-react";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";

export default function SettingsPage() {
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
                    <h1 className="text-3xl font-bold">Paramètres</h1>
                    <p className="text-muted-foreground">
                        Gérez vos préférences et votre compte
                    </p>
                </div>

                <div className="grid gap-6">
                    {/* Profile Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Profil
                            </CardTitle>
                            <CardDescription>
                                Vos informations personnelles gérées par Clerk
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
                                <LogOut className="mr-2 h-4 w-4" />
                                Se déconnecter
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Appearance Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                {theme === "dark" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                                Apparence
                            </CardTitle>
                            <CardDescription>
                                Personnalisez l'apparence de l'application
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Mode Sombre / Clair</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Choisissez votre préférence d'affichage
                                    </p>
                                </div>
                                <ThemeToggle />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Categories Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Catégories</CardTitle>
                            <CardDescription>
                                Gérez vos catégories de dépenses personnalisées
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <CategoryManager />
                        </CardContent>
                    </Card>

                    {/* About Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle>À Propos</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm text-muted-foreground space-y-2">
                                <p>Masrouf v1.0.0</p>
                                <p>Développé avec ❤️ pour la gestion de vos finances.</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
