import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Link } from "@/lib/navigation";
import { Button } from "@/components/ui/button";
import { getTranslations } from 'next-intl/server';
import PageTransition from "@/components/shared/PageTransition";

export default async function HomePage() {
  const { userId } = await auth();
  const t = await getTranslations('landing');

  // Si l'utilisateur est déjà connecté, rediriger vers le dashboard
  if (userId) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-background via-background to-secondary/20">
      <PageTransition className="container mx-auto px-4 text-center">
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
              {t('tagline')}
            </p>
          </div>

          {/* Description */}
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            {t('description')}
          </p>

          {/* Fonctionnalités */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-border bg-card p-6">
              <div className="text-3xl mb-2">💰</div>
              <h3 className="font-semibold mb-2">{t('featureExpenseTitle')}</h3>
              <p className="text-sm text-muted-foreground">{t('featureExpenseDesc')}</p>
            </div>
            <div className="rounded-lg border border-border bg-card p-6">
              <div className="text-3xl mb-2">📊</div>
              <h3 className="font-semibold mb-2">{t('featureStatsTitle')}</h3>
              <p className="text-sm text-muted-foreground">{t('featureStatsDesc')}</p>
            </div>
            <div className="rounded-lg border border-border bg-card p-6">
              <div className="text-3xl mb-2">🎯</div>
              <h3 className="font-semibold mb-2">{t('featureGoalsTitle')}</h3>
              <p className="text-sm text-muted-foreground">{t('featureGoalsDesc')}</p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/sign-up">
                {t('ctaStart')}
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
              <Link href="/sign-in">
                {t('ctaSignIn')}
              </Link>
            </Button>
          </div>
        </div>
      </PageTransition>
    </div>
  );
}
