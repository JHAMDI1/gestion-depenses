# Masrouf - Checklist Améliorations V1.1+

Ce fichier suit les améliorations et optimisations à implémenter après la Version 1.0.

## 🎯 Priorité 1 - Cette Semaine (Critique)

### Error Handling & Robustesse
- [x] Ajouter Error Boundary global (`app/error.tsx`)
- [x] Ajouter Error Boundary par locale (`app/[locale]/error.tsx`)
- [x] Créer composant réutilisable `ErrorUI`
- [ ] Tester avec erreurs simulées

### Centralisation du Code
- [x] Créer `lib/constants.ts`
  - [x] Migrer intervalles de temps (récurrentes)
  - [x] Migrer constantes de devise
  - [x] Migrer valeurs de configuration
- [x] Créer `lib/validation.ts` (Zod schemas)
  - [x] Schema transaction
  - [x] Schema catégorie
  - [x] Schema dette
  - [x] Schema budget
- [x] Créer `types/index.ts` pour types globaux

### UX - Loading States
- [x] Installer Framer Motion (`npm install framer-motion`)
- [x] Créer composants Skeleton
  - [x] `TransactionSkeleton`
  - [x] `CategorySkeleton`
  - [x] `ChartSkeleton`
- [x] Remplacer `Loader2` par skeletons dans :
  - [x] Dashboard
  - [x] Stats

### UX - Mobile
- [x] Fixer navigation mobile (carrousel 3 items)
- [x] Fixer icônes catégories visibles sur mobile
- [x] Ajouter indicateurs de scroll

---

## 🔍 Priorité 2 - Ce Mois (Important)

### Recherche & Filtrage
- [x] Créer composant `SearchBar`
- [x] Ajouter recherche dans Transactions
  - [x] Recherche par nom
  - [x] Filtre par catégorie
  - [x] Filtre par montant (min/max)
  - [x] Filtre par période (date range)
  - [x] Combinaison de filtres
- [x] Ajouter tri personnalisable
  - [x] Tri par date
  - [x] Tri par montant
  - [x] Tri par catégorie

### PWA (Progressive Web App)
- [x] Créer `public/manifest.json`
  - [x] Nom et description
  - [x] Icônes (192x192, 512x512)
  - [x] Theme color
  - [x] Background color
- [x] Configurer Service Worker
  - [x] Stratégie de cache
  - [x] Offline fallback
- [x] Ajouter bouton "Installer l'app"
- [x] Tester installation sur mobile

### Export Avancé
- [x] Installer `jsPDF` ou `pdfmake` ✅
- [x] Export PDF transactions ✅
  - [x] Mise en page professionnelle
  - [x] Logo et en-tête
  - [x] Filtrage par période
  - [x] Totaux et statistiques
  - [x] **Dialog nom de fichier personnalisé** 🆕
  - [x] **Téléchargement via Blob API** 🆕
- [ ] Export graphiques en image
  - [ ] Convertir charts Recharts en PNG
  - [ ] Bouton téléchargement par chart

### Sécurité & Performance
- [x] Rate Limiting Convex ✅
  - [x] Créer helper `checkRateLimit`
  - [x] Limiter mutations critiques
  - [x] Configurer limites par action
- [x] Validation Zod côté serveur ✅
  - [x] Valider toutes les mutations
  - [x] Messages d'erreur clairs
- [x] Audit Logs ✅
  - [x] Table `audit_logs` dans schema
  - [x] Logger actions critiques (create, update, delete)
  - [x] UI pour voir historique (admin) - *Backend prêt*

---

## 🎨 Priorité 3 - Mois Prochain (Nice to Have)

### UI/UX Polish
- [x] États vides illustrés
  - [x] Empty state Transactions (SVG + message)
  - [x] Empty state Budgets
  - [x] Empty state Goals
  - [x] Empty state Debts
- [x] Animations de transition
  - [x] Page transitions (Framer Motion)
  - [x] Micro-animations hover
  - [x] Animations de suppression (slide out)
- [ ] Mode sombre amélioré
  - [ ] Vérifier contraste AA
  - [ ] Affiner couleurs subtiles

### Notifications
- [ ] Choisir provider (Resend, SendGrid)
- [ ] Email alertes budget dépassé
  - [ ] Template email
  - [ ] Configuration SMTP
  - [ ] Opt-in utilisateur
- [ ] Email récapitulatif mensuel
  - [ ] Statistiques du mois
  - [ ] Graphiques intégrés
  - [ ] Conseils personnalisés

### Analytics & Insights (Sans IA)
- [x] Graphiques supplémentaires
  - [x] Évolution du solde dans le temps
  - [x] Top 10 dépenses du mois
  - [x] Prédiction linéaire solde futur
- [x] Comparaisons intelligentes
  - [x] Ce mois vs mois dernier (%)
  - [x] Cette année vs année dernière
  - [ ] Moyenne mobile 3/6/12 mois

---

## 🧪 Priorité 4 - Tests & Qualité

### Tests End-to-End
- [ ] Installer Playwright
- [ ] Tests critiques
  - [ ] Créer transaction (FR)
  - [ ] Créer transaction (AR)
  - [ ] Créer budget avec alerte
  - [ ] Générer récurrente
- [ ] Tests d'authentification
  - [ ] Sign in flow
  - [ ] Sign out
  - [ ] Protected routes

### SEO & Performance
- [x] Ajouter metadata à toutes les pages
  - [x] Dashboard
  - [x] Transactions
  - [x] Stats
  - [x] Budgets
  - [x] Goals
  - [x] Debts
  - [x] Recurrings
  - [x] Settings
- [x] Open Graph images
  - [x] Image statique générée
  - [ ] Ou image dynamique (Vercel OG)
- [x] Lighthouse audit
  - [x] Performance (Lazy loading charts)
  - [x] Accessibility (Metadata & Semantic HTML)
  - [x] Best Practices
  - [x] SEO (Metadata & OG Images)

### i18n Quality
- [ ] Vérifier toutes les clés traduites (FR)
- [ ] Vérifier toutes les clés traduites (AR)
- [ ] Script de détection clés manquantes
- [ ] Formatage dates/nombres cohérent

---

## 🚀 Priorité 5 - Fonctionnalités Avancées (V2)

### Multi-devises
- [ ] Ajouter champ devise dans schema
- [ ] API de conversion (ex: Fixer.io)
- [ ] Sélecteur devise utilisateur
- [ ] Affichage multi-devises dans stats

### Import Automatique
- [ ] Parser relevés bancaires PDF
- [ ] Import CSV transactions
- [ ] Mapping automatique catégories
- [ ] Détection doublons

### Mode Collaboratif
- [ ] Partage de budgets (famille)
- [ ] Permissions (lecture/écriture)
- [ ] Notifications collaborateurs
- [ ] Chat intégré (optionnel)

### Dashboard Analytics
- [ ] Heatmap dépenses par jour
- [ ] Prédictions basées sur historique
- [ ] Détection anomalies (dépense inhabituelle)
- [ ] Recommandations budgets optimaux

---

## 📦 Maintenance & Optimisation

### Code Quality
- [ ] Audit dépendances inutilisées
  - [ ] Vérifier `next-themes`
  - [ ] Vérifier `react-day-picker`
  - [ ] Vérifier `cmdk`
- [ ] ESLint rules plus strictes
- [ ] Prettier configuration
- [ ] Husky pre-commit hooks

### Documentation
- [ ] Changelog V1.0 → V1.1
- [ ] API documentation (Convex functions)
- [ ] Contribution guide
- [ ] Deployment guide (Vercel + Convex)

### Monitoring
- [ ] Intégrer Sentry (error tracking)
- [ ] Analytics (Vercel Analytics ou Plausible)
- [ ] Uptime monitoring
- [ ] Performance monitoring (Core Web Vitals)

---

## 📊 Suivi de Progression

### Légende
- `[ ]` Non commencé
- `[/]` En cours
- `[x]` Terminé
- `[!]` Bloqué (nécessite décision/ressource)

### Métriques de Succès
- **V1.1** : Priorités 1 + 2 complétées (≈ 3 semaines)
- **V1.5** : Priorités 1 + 2 + 3 complétées (≈ 2 mois)
- **V2.0** : Toutes priorités complétées (≈ 6 mois)

---

## 🎯 Prochaine Étape Immédiate

**Session Actuelle : COMPLÉTÉE ✅**

**Aujourd'hui (28 Nov 2025)** :
- ✅ PWA complète (manifest + service worker + install prompt)
- ✅ Export PDF professionnel (transactions + stats)
- ✅ Dialog nom de fichier personnalisé
- ✅ Empty States component
- ✅ 4 bugs corrigés (dont suppression transactions/budgets)
- ✅ Amélioration UI Dettes (Edition, Traductions)

**Prochaines Options** :
1. **Sécurité** : Rate Limiting + Validation Zod serveur (2h)
2. **Animations** : Transitions + Micro-animations (1.5h)
3. **Notifications** : Email alertes budget (3h)
4. **Déploiement** : Tester PWA + Production

**Temps Total Session** : ~3h30min ⏱️
**Features Livrées** : 3 majeures 🎉

