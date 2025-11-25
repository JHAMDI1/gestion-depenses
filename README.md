# Masrouf - Application de Gestion des Finances Personnelles

Application web moderne de gestion des finances personnelles construite avec Next.js, Clerk et Convex.

## 🚀 Fonctionnalités

- ✅ Authentification sécurisée avec Clerk
- 💰 Suivi des transactions et dépenses
- 📊 Statistiques et graphiques interactifs
- 🎯 Gestion des budgets par catégorie
- 💎 Objectifs d'épargne
- 🔄 Dépenses récurrentes
- 🌍 Support multilingue (Français / العربية)
- 🌙 Mode sombre par défaut avec thème violet moderne
- 📱 Design responsive

## 🛠️ Stack Technique

- **Framework**: Next.js 16 (App Router)
- **Langage**: TypeScript
- **Styling**: TailwindCSS v4
- **Composants UI**: shadcn/ui
- **Authentification**: Clerk
- **Base de données**: Convex (temps réel)
- **Graphiques**: Recharts
- **i18n**: next-intl
- **Déploiement**: Vercel

## 📦 Installation

1. Cloner le repository :
```bash
git clone <repository-url>
cd masrouf/web
```

2. Installer les dépendances :
```bash
npm install
```

3. Configurer les variables d'environnement :
```bash
cp .env.example .env.local
```

Puis remplir les valeurs dans `.env.local` :
- Créer un compte sur [Clerk](https://clerk.com) et copier les clés API
- Créer un projet sur [Convex](https://convex.dev) et copier l'URL

4. Initialiser Convex :
```bash
npx convex dev
```

5. Lancer le serveur de développement :
```bash
npm run dev
```

6. Ouvrir [http://localhost:3000](http://localhost:3000)

## 🔑 Variables d'Environnement

Voir `.env.example` pour la liste complète des variables requises.

### Clerk (Authentification)
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `CLERK_HOSTNAME` (ex: `your-subdomain.clerk.accounts.dev`)

### Convex (Base de données)
- `CONVEX_DEPLOYMENT` (ex: `prod:uncommon-spoonbill-708`)
- `NEXT_PUBLIC_CONVEX_URL` (ex: `https://uncommon-spoonbill-708.convex.cloud`)

### Site
- `NEXT_PUBLIC_SITE_URL` (ex: `https://gestion-depences.vercel.app`)

## 📁 Structure du Projet

```
web/
├── app/                    # Routes Next.js (App Router)
│   ├── [locale]/          # Routes avec support i18n
│   ├── (public)/          # Pages publiques
│   ├── (protected)/       # Pages protégées (auth requise)
│   └── layout.tsx         # Layout racine
├── components/            # Composants React
│   ├── ui/               # Composants shadcn/ui
│   ├── layout/           # Layout components
│   ├── dashboard/        # Composants du dashboard
│   └── ...
├── convex/               # Schémas et fonctions Convex
│   ├── schema.ts        # Définitions des tables
│   ├── categories.ts    # Queries/mutations catégories
│   ├── transactions.ts  # Queries/mutations transactions
│   └── ...
├── lib/                  # Utilitaires et helpers
├── messages/             # Fichiers de traduction i18n
│   ├── fr.json
│   └── ar.json
└── public/               # Assets statiques
```

## 🎨 Design System

- **Thème**: Violet moderne (#7c3aed)
- **Mode**: Sombre par défaut
- **Police**: Inter (Google Fonts)
- **Devise**: TND (Dinar Tunisien)
- **Langues**: Français + العربية (avec support RTL)

## 🚀 Déploiement

L'application est configurée pour être déployée sur Vercel :

1. Connecter le repository GitHub à Vercel
2. Configurer les variables d'environnement dans Vercel
3. Déployer automatiquement sur chaque push vers `main`

## 📝 Scripts Disponibles

```bash
npm run dev      # Serveur de développement
npm run build    # Build de production
npm run start    # Serveur de production
npm run lint     # Linter ESLint
```

## 🤝 Contribution

Ce projet est en cours de développement actif.

## 📄 Licence

Privé

## 👨‍💻 Auteur

Développé avec ❤️ pour une gestion financière simplifiée

---

## 🧱 Architecture & Scalabilité

- **Next.js 16 (App Router)**
  - Rendu côté serveur et client avec layouts imbriqués
  - i18n via `next-intl` (chargement paresseux des messages par locale)
- **Middleware unifié**
  - `clerkMiddleware` + `next-intl` pour protéger les routes et gérer la locale
- **Auth & Données**
  - Clerk pour l'auth (SSR-friendly), `SignedIn/SignedOut` côté client pour éviter les requêtes non authentifiées
  - Convex côté backend: accès scellé par `userId`, index `by_user` sur les collections
  - Providers: `ConvexProviderWithClerk` pour propager le contexte d'auth
- **Performance**
  - Gating des pages protégées empêche les requêtes Convex avant login
  - Agrégations lourdes à déplacer côté Convex (Phase V1 Stats backend)
- **Internationalisation & RTL**
  - `lang`/`dir` dynamiques au layout, classes utilitaires logiques (start/end)
- **Déploiement**
  - Vercel (serverless + cache), Convex cloud (temps réel, scaling géré)

## 🌐 Environnements & URLs

- Prod: `https://gestion-depences.vercel.app`
- Convex Prod: p.ex. `https://uncommon-spoonbill-708.convex.cloud`
- Assurez-vous d'ajouter les domaines Vercel dans Clerk (Verified domains / Authorized origins)

## 🔎 SEO

- Routes générées: `app/sitemap.ts`, `app/robots.ts`
- Définir `NEXT_PUBLIC_SITE_URL` en prod pour des URLs correctes
- À faire (V1): metadata locales (title/description), Open Graph/Twitter cards

## 🤖 Intégration LLM (Optionnelle – V1)

- Cas d'usage:
  - Analyse des dépenses par catégorie (insights, recommandations)
  - Requêtes en langage naturel: "Montre-moi mes dépenses du mois dernier en transport"
  - Suggestions de budgets et économies
- Implémentation (proposée):
  - API route sécurisée `/api/ai/analyze` utilisant un provider LLM (clé via `OPENAI_API_KEY` ou équivalent)
  - Agréger côté Convex puis résumer via LLM (pas d'envoi de données brutes non nécessaires)
- Sécurité & vie privée:
  - Masquer PII, anonymiser si besoin
  - Ne jamais embarquer une clé en client-side, toujours via route serveur
