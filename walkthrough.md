# Walkthrough - Phases 1 & 2 : Configuration Initiale et Authentification

## ✅ Phase 1 : Configuration Initiale (Terminée)

### Ce qui a été fait

#### 1. Projet Next.js
- ✅ Next.js 16 initialisé avec TypeScript
- ✅ App Router configuré
- ✅ TailwindCSS v4 installé

#### 2. Design System - Thème Violet Moderne
- ✅ Palette de couleurs violet moderne en mode sombre par défaut
  - Couleur primaire : `#7c3aed` (violet)
  - Background : Violet très sombre
  - Variables CSS avec oklch pour des couleurs modernes
- ✅ Police Inter (Google Fonts) configurée
- ✅ Support RTL pour l'arabe préparé dans `globals.css`

#### 3. shadcn/ui Components
- ✅ shadcn/ui initialisé
- ✅ 8 composants installés :
  - `button` - Boutons
  - `input` - Champs de saisie
  - `label` - Labels
  - `card` - Cartes
  - `dialog` - Modales
  - `select` - Sélecteurs
  - `textarea` - Zones de texte
  - `sonner` - Notifications toast

#### 4. Configuration Git
- ✅ Repository Git initialisé
- ✅ `.gitignore` configuré
- ✅ `.env.example` créé
- ✅ README.md complet avec documentation

---

## ✅ Phase 2 : Authentification Clerk (Terminée)

### Ce qui a été fait

#### 1. Installation Clerk
- ✅ Package `@clerk/nextjs` installé
- ✅ `ClerkProvider` ajouté au layout racine

#### 2. Middleware de Protection
- ✅ Fichier `middleware.ts` créé
- ✅ Routes publiques définies : `/`, `/sign-in`, `/sign-up`
- ✅ Toutes les autres routes protégées automatiquement

#### 3. Pages d'Authentification
- ✅ Page Sign-In : `app/sign-in/[[...sign-in]]/page.tsx`
- ✅ Page Sign-Up : `app/sign-up/[[...sign-up]]/page.tsx`
- ✅ Composants Clerk intégrés avec design centré

#### 4. Landing Page
- ✅ Page d'accueil publique créée (`app/page.tsx`)
- ✅ Branding Masrouf (مصروف) avec logo bilingue
- ✅ 3 cartes de fonctionnalités :
  - 💰 Suivi des Dépenses
  - 📊 Statistiques
  - 🎯 Objectifs
- ✅ Boutons CTA : "Commencer Gratuitement" et "Se Connecter"
- ✅ Redirection automatique vers `/dashboard` si déjà connecté

#### 5. Dashboard Protégé
- ✅ Page dashboard créée (`app/dashboard/page.tsx`)
- ✅ Protection par authentification
- ✅ Redirection vers `/sign-in` si non connecté

---

## 🧪 Tests à Effectuer

### Prérequis
Avant de tester, vous devez configurer vos clés Clerk :

1. **Créer un compte Clerk** (si ce n'est pas déjà fait)
   - Aller sur [https://clerk.com](https://clerk.com)
   - Créer un nouveau projet

2. **Copier les clés API**
   - Dans le dashboard Clerk, aller dans "API Keys"
   - Copier `Publishable Key` et `Secret Key`

3. **Créer le fichier `.env.local`**
   ```bash
   cp .env.example .env.local
   ```

4. **Remplir les variables dans `.env.local`**
   ```env
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
   CLERK_SECRET_KEY=sk_test_xxxxx
   
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
   NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
   NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
   ```

### Lancer le Serveur de Développement

```bash
cd web
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000)

### Scénarios de Test

#### ✅ Test 1 : Landing Page
1. Accéder à `http://localhost:3000`
2. **Vérifier** :
   - ✅ Page s'affiche avec le thème violet sombre
   - ✅ Logo "مصروف / Masrouf" visible
   - ✅ 3 cartes de fonctionnalités affichées
   - ✅ Boutons "Commencer Gratuitement" et "Se Connecter" présents

#### ✅ Test 2 : Inscription (Sign-Up)
1. Cliquer sur "Commencer Gratuitement"
2. **Vérifier** :
   - ✅ Redirection vers `/sign-up`
   - ✅ Formulaire Clerk s'affiche (centré)
   - ✅ Thème violet appliqué au formulaire
3. Créer un compte avec email/mot de passe
4. **Vérifier** :
   - ✅ Redirection automatique vers `/dashboard` après inscription

#### ✅ Test 3 : Dashboard Protégé
1. Après connexion, vérifier que `/dashboard` s'affiche
2. **Vérifier** :
   - ✅ Titre "Tableau de Bord" visible
   - ✅ Message de bienvenue affiché

#### ✅ Test 4 : Déconnexion et Reconnexion
1. Se déconnecter (via le composant Clerk si disponible)
2. Essayer d'accéder à `/dashboard` directement
3. **Vérifier** :
   - ✅ Redirection automatique vers `/sign-in`
4. Se reconnecter avec les identifiants
5. **Vérifier** :
   - ✅ Redirection vers `/dashboard`

#### ✅ Test 5 : Protection des Routes
1. En étant déconnecté, essayer d'accéder à `/dashboard`
2. **Vérifier** :
   - ✅ Redirection automatique vers `/sign-in`
3. Se connecter
4. Essayer d'accéder à `/` (landing page)
5. **Vérifier** :
   - ✅ Redirection automatique vers `/dashboard`

---

## ✅ Phase 3 : Base de Données Convex (Terminée)

### Ce qui a été fait

#### 1. Installation et Configuration
- ✅ Package `convex` installé
- ✅ Projet Convex initialisé : "masroufi"
- ✅ Package `@convex-dev/auth` installé pour l'intégration Clerk

#### 2. Schéma de Données
- ✅ Fichier `convex/schema.ts` créé avec 5 tables :
  - **categories** : Catégories de dépenses (Alimentation, Transport, etc.)
  - **transactions** : Dépenses individuelles
  - **budgets** : Limites mensuelles par catégorie
  - **goals** : Objectifs d'épargne
  - **recurrings** : Dépenses récurrentes (abonnements, etc.)
- ✅ Indexes optimisés pour les requêtes fréquentes

#### 3. Fonctions Convex

##### Categories (`convex/categories.ts`)
- ✅ `getCategories` - Lire toutes les catégories
- ✅ `createCategory` - Créer une catégorie
- ✅ `updateCategory` - Modifier une catégorie
- ✅ `deleteCategory` - Supprimer une catégorie
- ✅ `seedDefaultCategories` - Initialiser 8 catégories par défaut

##### Transactions (`convex/transactions.ts`)
- ✅ `getTransactions` - Lire toutes les transactions
- ✅ `getRecentTransactions` - Les 10 dernières
- ✅ `getTransactionsByMonth` - Filtrer par mois
- ✅ `getMonthlyTotal` - Total du mois en cours
- ✅ `createTransaction` - Créer une transaction
- ✅ `updateTransaction` - Modifier une transaction
- ✅ `deleteTransaction` - Supprimer une transaction

##### Budgets (`convex/budgets.ts`)
- ✅ `getBudgets` - Lire les budgets avec calcul automatique des dépenses
- ✅ `setBudget` - Définir ou mettre à jour un budget
- ✅ `deleteBudget` - Supprimer un budget

##### Goals (`convex/goals.ts`)
- ✅ `getGoals` - Lire les objectifs avec progression
- ✅ `createGoal` - Créer un objectif
- ✅ `updateGoalProgress` - Mettre à jour l'épargne
- ✅ `deleteGoal` - Supprimer un objectif

##### Recurrings (`convex/recurrings.ts`)
- ✅ `getRecurrings` - Lire les dépenses récurrentes
- ✅ `createRecurring` - Créer une récurrente
- ✅ `updateRecurring` - Modifier une récurrente
- ✅ `deleteRecurring` - Supprimer une récurrente

#### 4. Intégration Clerk + Convex
- ✅ `ConvexClientProvider` créé (`components/providers/ConvexClientProvider.tsx`)
- ✅ Intégration de `useAuth` de Clerk avec Convex
- ✅ Layout mis à jour pour utiliser le provider
- ✅ HTTP router créé pour webhooks Clerk

---

## 🧪 Tests Phase 3 : Convex

### Prérequis

Vous devez avoir configuré vos clés Clerk dans `.env.local` (Phase 2).

### Lancer Convex en Mode Développement

Dans un **nouveau terminal** (gardez `npm run dev` en cours) :

```bash
cd web
npx convex dev
```

**Ce que cette commande fait :**
- Génère les types TypeScript pour Convex
- Synchronise le schéma avec le cloud Convex
- Active le hot-reload pour les fonctions Convex
- Affiche les logs en temps réel

**Résultat attendu :**
```
✔ Convex functions ready!
```

### Vérifier la Configuration

1. **Dashboard Convex**
   - Ouvrir [https://dashboard.convex.dev](https://dashboard.convex.dev)
   - Sélectionner le projet "masroufi"
   - Vérifier que les 5 tables sont créées :
     - categories
     - transactions
     - budgets
     - goals
     - recurrings

2. **Tester les Fonctions**
   - Dans le dashboard Convex, aller dans "Functions"
   - Tester `categories.seedDefaultCategories` pour créer les catégories par défaut
   - Vérifier dans "Data" que les catégories sont créées

### Scénarios de Test (À venir dans Phase 4)

Une fois l'interface utilisateur créée, vous pourrez :
- ✅ Créer une transaction
- ✅ Voir les transactions dans le dashboard
- ✅ Définir un budget
- ✅ Créer un objectif d'épargne
- ✅ Ajouter une dépense récurrente

---

## 📊 État d'Avancement

### ✅ Phases Terminées
- [x] **Phase 1** : Configuration Initiale (2-3h) ✅
- [x] **Phase 2** : Authentification Clerk (1-2h) ✅
- [x] **Phase 3** : Base de Données Convex (3-4h) ✅

### 🔄 Prochaines Phases
- [ ] **Phase 1.5** : Internationalisation i18n (3-4h)
- [ ] **Phase 4** : Interface Utilisateur (12-15h) ⬅️ **Recommandé**
- [ ] **Phase 5** : Fonctionnalités Avancées (3-4h)
- [ ] **Phase 6** : Déploiement (1-2h)
- [ ] **Phase 7** : Polish & Optimisations (3-4h)
- [ ] **Phase 8** : Documentation (1-2h)

---

## 🎯 Prochaines Étapes Recommandées

### Option A : Interface Utilisateur (Recommandé)
Passer à la **Phase 4 : Interface Utilisateur** pour créer le dashboard et les composants.

**Avantages** :
- Application fonctionnelle rapidement
- Possibilité de tester visuellement les données
- Motivation en voyant l'app prendre forme

**Composants à créer** :
1. Dashboard avec résumé du mois
2. Composant "Ajouter une dépense"
3. Liste des transactions
4. Page Statistiques avec graphiques
5. Gestion des budgets
6. Objectifs d'épargne
7. Dépenses récurrentes

### Option B : Internationalisation
Passer à la **Phase 1.5 : i18n** pour le support FR/AR.

**Avantages** :
- Toutes les nouvelles pages seront traduites dès le début
- Support RTL pour l'arabe intégré
- Évite de devoir tout retraduire plus tard

---

## 📝 Notes Techniques

### Structure Convex
```
convex/
├── schema.ts              # Définition des tables
├── categories.ts          # Queries/mutations catégories
├── transactions.ts        # Queries/mutations transactions
├── budgets.ts             # Queries/mutations budgets
├── goals.ts               # Queries/mutations objectifs
├── recurrings.ts          # Queries/mutations récurrentes
├── http.ts                # HTTP router (webhooks)
├── auth.config.ts         # Configuration auth
└── _generated/            # Types générés automatiquement
```

### Commits Git
- ✅ `feat: initial Next.js setup with violet theme and shadcn/ui`
- ✅ `feat: add Clerk authentication with sign-in/sign-up pages and landing page`
- ✅ `feat: add Convex database with schema and all queries/mutations`

---

## ❓ Questions Fréquentes

**Q: Erreurs TypeScript dans les fichiers Convex ?**
R: Normal ! Lancer `npx convex dev` pour générer les types.

**Q: "Convex deployment not found" ?**
R: Vérifier que `NEXT_PUBLIC_CONVEX_URL` est bien dans `.env.local`.

**Q: Les catégories par défaut ne sont pas créées ?**
R: Appeler manuellement `seedDefaultCategories` depuis le dashboard Convex ou créer un bouton dans l'UI.

**Q: Comment tester les queries sans UI ?**
R: Utiliser le dashboard Convex → Functions → Sélectionner une query → "Run"

---

## 🔗 Ressources

- [Documentation Convex](https://docs.convex.dev)
- [Convex + Clerk Integration](https://docs.convex.dev/auth/clerk)
- [Dashboard Convex](https://dashboard.convex.dev)

---

## 📝 Notes Techniques

### Structure Actuelle du Projet
```
web/
├── app/
│   ├── dashboard/
│   │   └── page.tsx          # Dashboard protégé
│   ├── sign-in/
│   │   └── [[...sign-in]]/
│   │       └── page.tsx      # Page de connexion
│   ├── sign-up/
│   │   └── [[...sign-up]]/
│   │       └── page.tsx      # Page d'inscription
│   ├── layout.tsx            # Layout avec ClerkProvider
│   ├── page.tsx              # Landing page
│   └── globals.css           # Thème violet moderne
├── components/
│   └── ui/                   # Composants shadcn/ui
├── middleware.ts             # Protection des routes Clerk
├── .env.example              # Template des variables
└── README.md                 # Documentation
```

### Commits Git
- ✅ `feat: initial Next.js setup with violet theme and shadcn/ui`
- ✅ `feat: add Clerk authentication with sign-in/sign-up pages and landing page`

---

## ❓ Questions Fréquentes

**Q: Le thème violet ne s'affiche pas correctement ?**
R: Vérifier que `globals.css` est bien importé dans `layout.tsx` et que TailwindCSS v4 est configuré.

**Q: Erreur "Clerk publishable key is missing" ?**
R: Créer le fichier `.env.local` et y ajouter vos clés Clerk (voir section Tests).

**Q: Les pages sign-in/sign-up ne s'affichent pas ?**
R: Vérifier que les dossiers ont bien la structure `[[...sign-in]]` et `[[...sign-up]]`.

**Q: Redirection infinie entre `/` et `/dashboard` ?**
R: Vérifier la logique de redirection dans `app/page.tsx` et le middleware.

---

## 🎨 Personnalisation du Thème Clerk

Pour que les composants Clerk (sign-in/sign-up) correspondent au thème violet, vous pouvez personnaliser l'apparence dans le dashboard Clerk :

1. Aller dans **Customization** → **Appearance**
2. Choisir le thème "Dark"
3. Personnaliser les couleurs :
   - Primary color : `#7c3aed`
   - Background : `#1a1625`

Ou utiliser la propriété `appearance` dans les composants :
```tsx
<SignIn appearance={{
  baseTheme: dark,
  variables: { colorPrimary: '#7c3aed' }
}} />
```

---

## ✅ Phase 4 : Interface Utilisateur (Terminée)

### Ce qui a été fait

#### 1. Page Transactions (`app/transactions/page.tsx`)
- ✅ Liste complète avec pagination/scroll
- ✅ Recherche par description
- ✅ Filtrage par catégorie
- ✅ Suppression de transactions
- ✅ Empty states soignés

#### 2. Page Statistiques (`app/stats/page.tsx`)
- ✅ Intégration de Recharts
- ✅ Graphique en barres : Évolution mensuelle des dépenses
- ✅ Graphique en camembert : Répartition par catégorie
- ✅ KPIs : Total dépenses, Moyenne mensuelle
- ✅ Sélecteur de période (3, 6, 12 mois)

#### 3. Page Budgets (`app/budgets/page.tsx`)
- ✅ Visualisation des limites par catégorie
- ✅ Barres de progression avec codes couleur (Vert/Jaune/Rouge)
- ✅ Calcul automatique du "Reste à dépenser"
- ✅ Dialog pour définir/modifier les budgets

#### 4. Page Objectifs (`app/goals/page.tsx`)
- ✅ Suivi des projets d'épargne
- ✅ Barre de progression vers la cible
- ✅ Gestion des dates limites
- ✅ Ajout rapide d'épargne
- ✅ Célébration visuelle des objectifs atteints 🏆

#### 5. Page Dépenses Récurrentes (`app/recurrings/page.tsx`)
- ✅ Gestion des abonnements et charges fixes
- ✅ Toggle Actif/Inactif pour chaque dépense
- ✅ Affichage du jour de prélèvement
- ✅ Modification et suppression faciles

#### 6. Page Paramètres (`app/settings/page.tsx`)
- ✅ Profil utilisateur (via Clerk)
- ✅ Gestion des catégories personnalisées (Ajout/Suppression)
- ✅ Sélecteur de thème (Clair/Sombre) avec persistance
- ✅ Section "À propos"

---

## 🧪 Tests Phase 4 : Interface Complète

### Scénarios de Test

#### ✅ Test 1 : Gestion des Transactions
1. Aller sur le Dashboard
2. Cliquer sur "Ajouter une dépense"
3. Créer une dépense "Test" de 50 TND dans "Alimentation"
4. Aller sur la page Transactions
5. Vérifier que la dépense apparaît
6. La supprimer et vérifier sa disparition

#### ✅ Test 2 : Analyse Statistique
1. Créer plusieurs dépenses dans différentes catégories
2. Aller sur la page Statistiques
3. Vérifier que le camembert reflète la répartition
4. Vérifier que le total correspond

#### ✅ Test 3 : Contrôle Budgétaire
1. Aller sur la page Budgets
2. Définir un budget de 100 TND pour "Loisirs"
3. Ajouter une dépense de 120 TND dans "Loisirs"
4. Vérifier que la barre de budget devient rouge (Dépassement)

#### ✅ Test 4 : Suivi d'Objectifs
1. Aller sur la page Objectifs
2. Créer un objectif "Vacances" de 1000 TND
3. Ajouter 500 TND d'épargne
4. Vérifier que la progression est à 50%

#### ✅ Test 5 : Abonnements
1. Aller sur la page Récurrentes
2. Ajouter "Netflix" - 15 TND - le 5 du mois
3. Désactiver l'abonnement via le switch
4. Vérifier le changement d'état visuel (opacité)

#### ✅ Test 6 : Personnalisation
1. Aller sur la page Paramètres
2. Changer le thème en "Light Mode"
3. Vérifier que toute l'application s'adapte
4. Ajouter une catégorie personnalisée "Crypto" avec l'icône 🚀
5. Vérifier qu'elle est disponible lors de l'ajout d'une transaction
