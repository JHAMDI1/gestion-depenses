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

### Convex (Base de données)
- `CONVEX_DEPLOYMENT`
- `NEXT_PUBLIC_CONVEX_URL`

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
