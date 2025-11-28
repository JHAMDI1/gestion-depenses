# Guide de Contribution - Masrouf

Merci de votre intérêt pour contribuer à Masrouf ! 🎉

## 📋 Table des Matières

- [Code de Conduite](#code-de-conduite)
- [Comment Contribuer](#comment-contribuer)
- [Installation pour le Développement](#installation-pour-le-développement)
- [Soumettre des Modifications](#soumettre-des-modifications)
- [Standards de Code](#standards-de-code)
- [Rapporter des Bugs](#rapporter-des-bugs)
- [Proposer des Fonctionnalités](#proposer-des-fonctionnalités)

## 📜 Code de Conduite

Ce projet adhère au [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). En participant, vous vous engagez à respecter ce code.

## 🤝 Comment Contribuer

Il existe plusieurs façons de contribuer à Masrouf :

- 🐛 **Rapporter des bugs** : Signalez les problèmes via les [Issues GitHub](../../issues)
- ✨ **Proposer des fonctionnalités** : Suggérez de nouvelles idées
- 📖 **Améliorer la documentation** : Corrigez ou améliorez la doc
- 💻 **Contribuer du code** : Corrigez des bugs ou implémentez des features
- 🌍 **Traductions** : Ajoutez de nouvelles langues (actuellement FR/AR)

## 🛠️ Installation pour le Développement

### Prérequis

- Node.js 18+ et npm/pnpm
- Un compte [Clerk](https://clerk.com) (gratuit)
- Un compte [Convex](https://convex.dev) (gratuit)

### Étapes d'Installation

1. **Fork le repository** sur GitHub

2. **Clonez votre fork** :
   ```bash
   git clone https://github.com/VOTRE-USERNAME/masrouf.git
   cd masrouf/web
   ```

3. **Installez les dépendances** :
   ```bash
   npm install
   # ou
   pnpm install
   ```

4. **Configurez les variables d'environnement** :
   ```bash
   cp .env.example .env.local
   ```
   
   Remplissez `.env.local` avec vos clés :
   - Créez une application sur [Clerk Dashboard](https://dashboard.clerk.com)
   - Créez un projet sur [Convex Dashboard](https://dashboard.convex.dev)
   - Copiez les clés API dans `.env.local`

5. **Lancez Convex en mode développement** :
   ```bash
   npx convex dev
   ```

6. **Lancez le serveur de développement** (dans un autre terminal) :
   ```bash
   npm run dev
   ```

7. **Ouvrez** [http://localhost:3000](http://localhost:3000)

## 🔄 Soumettre des Modifications

### Workflow Git

1. **Créez une branche** depuis `main` :
   ```bash
   git checkout main
   git pull origin main
   git checkout -b feature/ma-nouvelle-feature
   # ou
   git checkout -b fix/correction-bug
   ```

2. **Faites vos modifications** et committez régulièrement :
   ```bash
   git add .
   git commit -m "feat: ajout de la fonctionnalité X"
   ```

3. **Poussez votre branche** :
   ```bash
   git push origin feature/ma-nouvelle-feature
   ```

4. **Ouvrez une Pull Request** sur GitHub vers la branche `main`

### Convention de Commits

Utilisez des messages de commit clairs suivant le format [Conventional Commits](https://www.conventionalcommits.org/) :

- `feat: description` - Nouvelle fonctionnalité
- `fix: description` - Correction de bug
- `docs: description` - Modifications de documentation
- `style: description` - Formatage, point-virgules, etc.
- `refactor: description` - Refactoring de code
- `test: description` - Ajout ou modification de tests
- `chore: description` - Tâches de maintenance

**Exemples** :
```bash
git commit -m "feat: ajout de la gestion multi-devises"
git commit -m "fix: correction du calcul de balance"
git commit -m "docs: mise à jour du README avec nouvelles instructions"
```

## ✅ Standards de Code

### Style

- **TypeScript** : Typez toutes les fonctions et variables
- **Linting** : Exécutez `npm run lint` avant de committer
- **Formatage** : Utilisez l'autoformat de votre éditeur

### Structure

- **Composants React** : Un composant par fichier
- **Naming** :
  - Composants : `PascalCase` (ex: `TransactionCard.tsx`)
  - Fonctions : `camelCase` (ex: `calculateBalance`)
  - Constantes : `UPPER_SNAKE_CASE` (ex: `DEFAULT_CURRENCY`)
- **Imports** : Groupez et ordonnez (React → Next.js → Lib → Components → Styles)

### Composants UI

```typescript
// Exemple de structure de composant
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface MyComponentProps {
  title: string;
  onAction?: () => void;
}

export function MyComponent({ title, onAction }: MyComponentProps) {
  const [state, setState] = useState(false);
  
  return (
    <div className="flex flex-col gap-4">
      <h2>{title}</h2>
      <Button onClick={onAction}>Action</Button>
    </div>
  );
}
```

### Convex Backend

- **Sécurité** : Toujours vérifier `userId` dans les queries/mutations
- **Indexation** : Ajoutez des index pour les queries fréquentes
- **Transactions** : Utilisez les transactions Convex pour les opérations atomiques

```typescript
// Exemple de mutation sécurisée
export const createTransaction = mutation({
  args: { /* ... */ },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const userId = identity.subject;
    // ... votre logique
  },
});
```

## 🐛 Rapporter des Bugs

Avant de créer un bug report :

1. **Vérifiez** que le bug n'a pas déjà été reporté dans les [Issues](../../issues)
2. **Testez** avec la dernière version de `main`

**Créez une Issue** avec :
- **Titre clair** : "Bug: Le calcul de balance est incorrect"
- **Description** : Expliquez le problème
- **Étapes de reproduction** : Comment reproduire le bug
- **Comportement attendu** : Ce qui devrait se passer
- **Comportement actuel** : Ce qui se passe réellement
- **Screenshots** : Si applicable
- **Environnement** : OS, navigateur, version Node.js

## ✨ Proposer des Fonctionnalités

Avant de proposer une feature :

1. **Vérifiez** la [roadmap](README.md#-feuille-de-route-roadmap) et les [Issues](../../issues)
2. **Discutez** de l'idée dans une [Discussion GitHub](../../discussions) si c'est une grosse feature

**Créez une Feature Request** avec :
- **Titre clair** : "Feature: Support multi-devises"
- **Problème** : Quel problème cela résout-il ?
- **Solution proposée** : Comment l'implémenter ?
- **Alternatives** : Autres approches possibles
- **Contexte** : Cas d'usage, mockups, etc.

## 🌍 Traductions

Pour ajouter une nouvelle langue :

1. **Créez** `messages/LOCALE.json` (ex: `messages/en.json`)
2. **Copiez** la structure depuis `messages/fr.json`
3. **Traduisez** tous les textes
4. **Mettez à jour** `i18n.ts` pour ajouter la locale
5. **Testez** l'application dans la nouvelle langue

## 📝 Checklist Pull Request

Avant de soumettre votre PR, vérifiez :

- [ ] Le code compile sans erreurs (`npm run build`)
- [ ] Le linting passe (`npm run lint`)
- [ ] Les tests passent (si applicable)
- [ ] La documentation est à jour
- [ ] Les commits suivent la convention
- [ ] La PR a une description claire
- [ ] Les fichiers non pertinents ne sont pas inclus

## 🙏 Merci !

Votre contribution, quelle qu'elle soit, est précieuse pour améliorer Masrouf. Merci de prendre le temps de contribuer ! ❤️

---

**Questions ?** N'hésitez pas à ouvrir une [Discussion](../../discussions) ou à demander dans votre Pull Request.
