import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function HomePage() {
  const { userId } = await auth();

  // Si l'utilisateur est déjà connecté, rediriger vers le dashboard
  if (userId) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-background via-background to-secondary/20">
      <div className="container mx-auto px-4 text-center">
        <div className="mx-auto max-w-3xl space-y-8">
          {/* Logo/Titre */}
          <div className="space-y-4">
            <h1 className="text-6xl font-bold tracking-tight text-primary">
              مصروف
            </h1>
            <h2 className="text-4xl font-bold text-foreground">
              Masrouf
            </h2>
            <p className="text-xl text-muted-foreground">
              Gestion des Finances Personnelles
            </p>
          </div>

          {/* Description */}
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Prenez le contrôle de vos finances avec Masrouf.
            Suivez vos dépenses, gérez vos budgets et atteignez vos objectifs d'épargne
            en toute simplicité.
          </p>

          {/* Fonctionnalités */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-border bg-card p-6">
              <div className="text-3xl mb-2">💰</div>
              <h3 className="font-semibold mb-2">Suivi des Dépenses</h3>
              <p className="text-sm text-muted-foreground">
                Enregistrez et catégorisez toutes vos transactions
              </p>
            </div>
            <div className="rounded-lg border border-border bg-card p-6">
              <div className="text-3xl mb-2">📊</div>
              <h3 className="font-semibold mb-2">Statistiques</h3>
              <p className="text-sm text-muted-foreground">
                Visualisez vos habitudes de dépenses avec des graphiques
              </p>
            </div>
            <div className="rounded-lg border border-border bg-card p-6">
              <div className="text-3xl mb-2">🎯</div>
              <h3 className="font-semibold mb-2">Objectifs</h3>
              <p className="text-sm text-muted-foreground">
                Définissez et atteignez vos objectifs d'épargne
              </p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/sign-up">
                Commencer Gratuitement
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
              <Link href="/sign-in">
                Se Connecter
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
