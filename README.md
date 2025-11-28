# Masrouf - Application de Gestion des Finances Personnelles

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Convex](https://img.shields.io/badge/Convex-Backend-orange)](https://convex.dev/)

Application web moderne de gestion des finances personnelles construite avec Next.js, Clerk et Convex.

## 📚 Documentation

- 📖 [**Guide Utilisateur**](GUIDE_UTILISATEUR.md) - Documentation complète pour utiliser l'application
- 🤝 [**Guide de Contribution**](CONTRIBUTING.md) - Comment contribuer au projet
- 📜 [**Code de Conduite**](CODE_OF_CONDUCT.md) - Règles de la communauté

## 📋 Table des Matières

- [Fonctionnalités](#-fonctionnalités)
- [Stack Technique](#️-stack-technique)
- [Installation](#-installation)
- [Variables d'Environnement](#-variables-denvironnement)
- [Structure du Projet](#-structure-du-projet)
- [Design System](#-design-system--theming)
- [Internationalisation](#-internationalisation-i18n)
- [SEO](#-seo)
- [Automatisation](#️-automatisation-cron-jobs)
- [Déploiement](#-déploiement)
- [Scripts Disponibles](#-scripts-disponibles)
- [Architecture](#-architecture--scalabilité)
- [Feuille de Route](#-feuille-de-route-roadmap)
- [Contribution](#-contribution)
- [Licence](#-licence)

## 🚀 Fonctionnalités

### Gestion Financière
- ✅ **Authentification sécurisée** avec Clerk
- 💰 **Transactions** : Suivi des revenus et dépenses avec distinction claire
- 💵 **Système de Balance** : Calcul automatique du solde disponible (initial + revenus - dépenses ± dettes - épargne)
- 📊 **Statistiques avancées** : Graphiques revenus vs dépenses, comparaisons, répartition par catégorie
- 🎯 **Budgets** : Gestion des budgets par catégorie avec alertes de dépassement
- 💎 **Objectifs d'épargne** : Suivi des progrès vers vos objectifs
- 🔄 **Dépenses récurrentes** : Génération automatique quotidienne (cron) + manuelle
- 🤝 **Dettes** : Suivi des emprunts et prêts avec statut de paiement

### Expérience Utilisateur
- 🌍 **Multilingue** : Support complet FR/AR avec RTL pour l'arabe
- 🌙 **Mode sombre** : Thème violet moderne par défaut
- 📱 **Design responsive** : Optimisé mobile, tablette, desktop
- ⚡ **Temps réel** : Synchronisation instantanée avec Convex
- 🎨 **UI moderne** : Glassmorphism, animations fluides, micro-interactions

## 🛠️ Stack Technique

### Frontend
- **Framework**: Next.js 16 (App Router)
- **Langage**: TypeScript
- **Styling**: TailwindCSS v4
- **Composants UI**: shadcn/ui
- **Graphiques**: Recharts
- **i18n**: next-intl
- **Notifications**: Sonner

### Backend
- **BaaS**: Convex (temps réel, serverless)
- **Authentification**: Clerk
- **Cron Jobs**: Convex Crons (génération automatique récurrentes)

### Déploiement
- **Hosting**: Vercel
- **Database**: Convex Cloud

## 📦 Installation

### Démarrage Rapide

1. **Cloner le repository** :
```bash
git clone https://github.com/JHAMDI1/gestion-depences.git
cd gestion-depences/web
```

> 💡 **Astuce** : Remplacez `JHAMDI1` par votre nom d'utilisateur GitHub si vous avez forké le projet.

2. **Installer les dépendances** :
```bash
npm install
# ou
pnpm install
```

3. **Configurer les variables d'environnement** :
```bash
cp .env.example .env.local
```

Puis remplir les valeurs dans `.env.local` :
- Créer un compte sur [Clerk](https://clerk.com) et copier les clés API
- Créer un projet sur [Convex](https://convex.dev) et copier l'URL

4. **Initialiser Convex** :
```bash
npx convex dev
```

5. **Lancer le serveur de développement** :
```bash
npm run dev
```

6. **Ouvrir** [http://localhost:3000](http://localhost:3000)

> 📖 Pour plus de détails sur la configuration, consultez le [Guide de Contribution](CONTRIBUTING.md).


## 🔑 Variables d'Environnement

Voir `.env.example` pour la liste complète des variables requises.

### Clerk (Authentification)
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `CLERK_HOSTNAME` (ex: `your-subdomain.clerk.accounts.dev`)

### Convex (Base de données)
- `CONVEX_DEPLOYMENT` (ex: `prod:<project-convex-name>`)
- `NEXT_PUBLIC_CONVEX_URL` (ex: `https://<project-convex-name>.convex.cloud`)

### Site
- `NEXT_PUBLIC_SITE_URL` (ex: `https://gestion-depences.vercel.app`)

## 📁 Structure du Projet

```
web/
├── app/                    # Routes Next.js (App Router)
│   ├── [locale]/          # Routes avec support i18n
│   │   ├── dashboard/     # Tableau de bord
│   │   ├── transactions/  # Gestion transactions
│   │   ├── stats/         # Statistiques & graphiques
│   │   ├── budgets/       # Gestion budgets
│   │   ├── goals/         # Objectifs d'épargne
│   │   ├── recurrings/    # Transactions récurrentes
│   │   ├── debts/         # Gestion des dettes
│   │   └── settings/      # Paramètres utilisateur
│   └── layout.tsx         # Layout racine
├── components/            # Composants React
│   ├── ui/               # shadcn/ui primitives
│   ├── layout/           # AppLayout, NavBar
│   ├── dashboard/        # StatsCards, BalanceCard
│   ├── transactions/     # AddTransactionDialog, EditTransactionDialog
│   ├── balance/          # BalanceCard, SetInitialBalanceDialog
│   ├── goals/            # AddSavingsDialog, WithdrawSavingsDialog
│   └── settings/         # CategoryManager, DataExporter
├── convex/               # Backend Convex
│   ├── schema.ts        # Schéma DB (tables, indexes)
│   ├── crons.ts         # Jobs planifiés (récurrentes)
│   ├── categories.ts    # CRUD catégories
│   ├── transactions.ts  # CRUD transactions
│   ├── balance.ts       # Calcul solde + queries
│   ├── stats.ts         # Agrégations pour statistiques
│   ├── recurring_generator.ts  # Génération transactions auto
│   └── ...
├── lib/                  # Utilitaires
│   └── metadata.ts      # Helper SEO metadata
├── messages/             # Traductions i18n
│   ├── fr.json          # Français
│   └── ar.json          # العربية
└── public/               # Assets statiques
```

## 🎨 Design System & Theming

### Tokens CSS (globals.css)
Le thème utilise des **variables CSS** pour une personnalisation facile :
```css
:root {
  --background: 224 71% 4%;      /* Fond principal */
  --foreground: 213 31% 91%;     /* Texte principal */
  --primary: 263 70% 50%;        /* Violet moderne */
  --card: 224 71% 4%;            /* Fond cartes */
  --muted: 223 47% 11%;          /* Éléments discrets */
  /* ... */
}
```

### Palette
- **Thème** : Violet moderne (#7c3aed)
- **Mode** : Sombre par défaut
- **Accent** : Dégradés violet-bleu
- **Success** : Vert (#10b981) pour revenus
- **Destructive** : Rouge (#ef4444) pour dépenses

### Typographie
- **Police** : Inter (Google Fonts) - clean et moderne
- **Tailles** : Scale harmonisée (text-sm → text-3xl)

### Effets
- **Glassmorphism** : `backdrop-blur-xl` + `bg-card/95`
- **Transitions** : `transition-all duration-300`
- **Shadows** : `shadow-lg shadow-primary/20`

## 🌍 Internationalisation (i18n)

- **Locales supportées** : Français (fr), العربية (ar)
- **RTL** : Support complet right-to-left pour l'arabe
- **Fichiers** : `messages/fr.json`, `messages/ar.json`
- **Routing** : `/fr/dashboard`, `/ar/dashboard`
- **Devise** : TND (Dinar Tunisien) - adaptable

## 📊 SEO

### Metadata Helper
Le fichier `lib/metadata.ts` génère automatiquement les métadonnées SEO :
```typescript
export function generateMetadata(locale: string) {
  return {
    title: locale === 'ar' ? 'مصروف' : 'Masrouf',
    description: '...',
    keywords: ['finance', 'budget', 'épargne'],
    // ...
  }
}
```

### Fichiers générés
- `app/sitemap.ts` : Plan du site XML
- `app/robots.ts` : Directives pour crawlers

### Configuration
- Définir `NEXT_PUBLIC_SITE_URL` en production pour URLs canoniques
- À ajouter : Open Graph images, Twitter cards

## ⚙️ Automatisation (Cron Jobs)

### Récurrentes Automatiques
Fichier : `convex/crons.ts`

**Job quotidien** (minuit UTC) :
```typescript
crons.daily(
    "generate recurring transactions",
    { hourUTC: 0, minuteUTC: 0 },
    internal.recurring_generator.processAllRecurrings
);
```

**Logique** (`processAllRecurrings`) :
- Parcourt toutes les récurrentes actives
- Vérifie si `lastGenerated` > 24h
- Crée une transaction automatique
- Met à jour `lastGenerated`
- Protection anti-doublons native

## 🚀 Déploiement

### Vercel (Recommandé)
1. Connecter le repository GitHub à Vercel
2. Configurer les variables d'environnement
3. Déployer automatiquement sur push `main`

### Convex
```bash
npx convex deploy --prod
```

### Configuration DNS
- Ajouter les domaines Vercel dans **Clerk** (Verified domains)
- Définir `NEXT_PUBLIC_SITE_URL` avec l'URL de production

## 📝 Scripts Disponibles

```bash
npm run dev      # Serveur de développement
npm run build    # Build de production
npm run start    # Serveur de production
npm run lint     # Linter ESLint
```

## 🧱 Architecture & Scalabilité

### Next.js 16 (App Router)
- **SSR/CSR hybride** avec layouts imbriqués
- **Middleware unifié** : Clerk + next-intl
- **Route handlers** pour API endpoints

### Convex Backend
- **Temps réel** : Live queries avec synchronisation instantanée
- **Sécurité** : Toutes les queries/mutations scellées par `userId`
- **Index** : `by_user` sur chaque table pour perf
- **Agrégations** : Calculs lourds côté serveur (stats, balance)

### Performance
- **Gating client** : Pages protégées empêchent requêtes non-auth
- **Server-side stats** : Réduction du transfert de données
- **Lazy loading** : Messages i18n chargés par locale

### Observabilité (À venir)
- Intégration Sentry pour error tracking
- Logs structurés Convex

## 🤖 Intégration LLM (Planifié - V2)

### Cas d'usage
- **Analyse intelligente** : Insights sur habitudes de dépenses
- **Recommandations** : Suggestions personnalisées de budgets
- **Requêtes naturelles** : "Mes dépenses en transport ce mois ?"

### Architecture proposée
- **Route serveur** : `/api/ai/analyze` (next API route)
- **Provider** : OpenAI GPT-4 ou équivalent
- **Sécurité** :
  - Clé API côté serveur uniquement (`OPENAI_API_KEY`)
  - Agrégation Convex → envoi résumé anonymisé au LLM
  - Pas d'exposition de PII (Personal Identifiable Information)

### Variables supplémentaires
```env
OPENAI_API_KEY=sk-...  # Ou autre provider (Mistral, Anthropic)
```

## 🤝 Contribution

Les contributions sont les bienvenues ! Ce projet est ouvert à la communauté.

**Pour contribuer** :
1. ⭐ **Star** le projet si vous l'aimez
2. 🐛 **Rapportez des bugs** via les [Issues](../../issues)
3. 💡 **Proposez des features** via les [Feature Requests](../../issues/new?template=feature_request.md)
4. 🔧 **Soumettez des Pull Requests**

📖 **Consultez le [Guide de Contribution](CONTRIBUTING.md)** pour les détails sur :
- Comment configurer l'environnement de développement
- Les conventions de code et commits
- Le processus de Pull Request

📜 **Lisez le [Code de Conduite](CODE_OF_CONDUCT.md)** - nous nous engageons à maintenir un environnement accueillant pour tous.

## 📄 Licence

Ce projet est sous licence **MIT** - voir le fichier [LICENSE](LICENSE) pour plus de détails.

Cela signifie que vous êtes libre de :
- ✅ Utiliser le code à des fins commerciales
- ✅ Modifier le code
- ✅ Distribuer le code
- ✅ Utiliser le code en privé

À condition de :
- 📝 Inclure la licence et le copyright dans toute copie
- 🚫 Ne pas tenir les auteurs responsables

## 👨‍💻 Auteur

Développé avec ❤️ pour une gestion financière simplifiée et moderne

---

## 🎯 Feuille de Route (Roadmap)

### ✅ Version 1.0 (Actuelle)
- [x] Balance automatique avec calcul complet
- [x] Stats revenus vs dépenses
- [x] Cron automatique récurrentes
- [x] Gestion dettes (emprunts/prêts)
- [x] Modifier/Supprimer catégories
- [x] Export CSV

### 🔮 Version 2.0 (Planifié)
- [ ] Analyse LLM avec insights personnalisés
- [ ] Notifications push (dépassements budget)
- [ ] Multi-devises
- [ ] Import automatique relevés bancaires
- [ ] Dashboard analytics avancé
- [ ] Mode collaboratif (partage budgets)
