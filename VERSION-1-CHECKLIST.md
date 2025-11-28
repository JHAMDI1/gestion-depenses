# Version 1 – Checklist complète

Toujours cocher les étapes terminées, puis passer à la suivante. Si vous faites des étapes non listées, ajoutez-les comme sous-étapes.

## 0) Pré-requis et Base (terminé)
- [x] Déploiement Vercel (prod) opérationnel
- [x] Env Clerk/Convex/URL prod configurés (incl. `CLERK_HOSTNAME`, `NEXT_PUBLIC_SITE_URL`)
- [x] i18n FR/AR stable + RTL
- [x] Pages protégées derrière `SignedIn`/`SignedOut`
- [x] sitemap.xml et robots.txt

## 1) Revue Architecture & Scalabilité
- [x] Middleware unifié (Clerk + next-intl) et routing i18n correct
- [x] Gating client pour empêcher les requêtes Convex non authentifiées
- [x] Convex organisé par tables avec index `by_user` et contrôle d’accès par `userId`
- [x] Déplacer agrégations lourdes vers Convex (Stats backend)
- [ ] Ajouter logs/observabilité (ex: Sentry) et error boundaries pour routes protégées
- [ ] Taux de requêtes Convex évalué et limité si besoin (prévention surcharges)

Sous-étapes (si besoin):
- [x] Endpoint Convex d’agrégation: dépenses mensuelles groupées par catégorie
- [x] Endpoint Convex d’agrégation: séries temporelles mensuelles (N derniers mois)
- [x] Frontend Stats branché sur endpoints Convex

## 2) UI/Design – Thème moderne (améliorations)
- [ ] Définir tokens de thème (CSS variables) accessibles (contraste AA)
- [ ] Unifier palette Light/Dark (surfaces, border, muted, accent, primary)
- [ ] Harmoniser tailles (espacement, radius, typographie) et icônes (Lucide)
- [ ] Réviser RTL (spacing start/end) sur toutes les pages
- [ ] Affiner Dashboard (têtes de section, densité, états vides)
- [ ] QA UI mobile (petits écrans) et a11y (focus, roles)

Sous-étapes (si besoin):
- [x] globals.css: variables couleurs (background/foreground, card, border, input, ring, primary, secondary, accent, muted, destructive)
- [x] globals.css: radius cohérent
- [x] globals.css: transitions cohérentes
- [x] globals.css: focus-visible et sélection (a11y)
- [x] AppLayout: padding responsive container
- [ ] Remplacer couleurs hardcodées par tokens (components et pages)
- [x] Components: transitions cohérentes (Button, Input, Nav)
- [x] Stats: chart colors et tooltips alignés sur tokens
- [x] Mobile: Bottom navigation + padding contenu (pb-20)
- [x] Mobile: Tables overflow-x-auto (Transactions, Stats table)
- [x] Mobile: SelectTrigger full-width sur petits écrans
- [x] Mobile: Fallback couleur catégories (tokens) dans listes

## 3) Fonctionnalités V1 (métier)
- [x] **Transactions – Type Revenu/Dépense**
  - [x] Ajout champ `type` au schéma (optionnel pour compatibilité)
  - [x] Sélecteur Type dans AddTransactionDialog (EXPENSE/INCOME)
  - [x] Mutations mises à jour avec valeur par défaut EXPENSE
- [x] **Dettes – Gestion complète**
  - [x] Table `debts` dans le schéma
  - [x] API CRUD complète (create, update, delete, togglePaid)
  - [x] Page `/debts` avec filtres (Tout/Emprunté/Prêté)
  [x] Dialog de création/édition de dette
  - [x] Navigation mise à jour (icône Handshake)
- [x] **Export de données**
  - [x] Composant DataExportButton (export CSV)
  - [x] Intégration dans Settings/Data
  - [x] Export transactions avec colonnes: Date, Description, Catégorie, Montant, Type
- [x] **Traductions complètes**
  - [x] Français: toutes les clés (debts, income, export)
  - [x] Arabe: toutes les traductions ajoutées
- [x] Transactions – Édition
  - [x] Activer bouton Edit et dialog pré-rempli
  - [x] Mutation `transactions.updateTransaction` (existe déjà)
  - [x] Tests UI (edit, cancel, save, validation)
- [x] Budgets – Alertes réelles
  - [x] Calcul dépenses mensuelles par catégorie vs `monthlyLimit`
  - [x] Afficher compteur d'alertes + liste détaillée (Dashboard)
  - [x] Stats cards mises à jour avec budget restant et alertes
- [x] Récurrents – Engine (planificateur Convex)
  - [x] Logique de génération de transaction (anti-doublons)
  - [x] UI: Bouton de génération manuelle "Générer"
  - [x] Tâche planifiée (cron) pour automatisation complète
  - [x] `convex/crons.ts` configuré avec job quotidien
  - [x] `processAllRecurrings` internal mutation
- [x] Stats – Agrégations backend Convex (perf)
  - [x] Endpoints agrégés (répartition par catégorie, séries mensuelles)
  - [x] Support complet Revenus vs Dépenses (Toggle)
  - [x] Remplacement du calcul côté client
- [x] Goals – UX épargne
  - [x] Créé AddSavingsDialog et WithdrawSavingsDialog
  - [x] Mutations addSavings et withdrawSavings dans Convex
  - [x] Remplacé `prompt` par dialogs structurés avec validation
- [x] **Système de Balance (Solde)**
  - [x] Table `balance` et logique de calcul (Revenus - Dépenses + Dettes)
  - [x] Composant `BalanceCard` avec détails dépliables
  - [x] Dialog d'initialisation du solde
- [x] **Catégories – Gestion complète**
  - [x] Modifier catégorie (nom, icône, couleur)
  - [x] Supprimer catégorie avec confirmation

## 4) SEO/Perf/Qualité
- [/] Metadata locales (title/description par page)
  - [x] Créé lib/metadata.ts helper
  - [ ] Ajouter metadata à toutes les pages
- [ ] Open Graph/Twitter cards (images dynamiques si possible)
- [ ] Lighthouse ≥ 90 (Perf/Best/A11y/SEO)
- [ ] Tests e2e Playwright (FR/AR + auth smoke)
- [ ] Vérification intégrité i18n (clés manquantes)

## 5) LLM – Analyse intelligente (option V1)
- [ ] Choisir provider (OpenAI/Mistral/Anthropic via clé serveur)
- [ ] API route `/api/ai/analyze` (server-only) avec rate-limit
- [ ] Agrégation Convex -> résumé LLM (pas d’envoi de PII inutile)
- [ ] Prompt design (objectifs, style, disclaimers)
- [ ] UI: bouton “Analyser mes dépenses” + affichage insights
- [ ] Journalisation et gestion erreurs (timeouts/quota)

Variables supplémentaires si activé:
- [ ] `OPENAI_API_KEY` (ou provider équivalent)

## 6) Documentation & Opérations
- [x] Mettre à jour README (tokens thème, SEO, LLM, nouvelles features)
  - [x] Section Features complète (Balance, Dettes, Stats Revenus, Cron)
  - [x] Section Design System & Theming (tokens CSS)
  - [x] Section SEO (metadata.ts)
  - [x] Section Automatisation (Cron Jobs)
  - [x] Section LLM (architecture V2)
  - [x] Roadmap V1/V2
- [x] Mettre à jour walkthrough (Design modernization)
- [x] Guide d'export CSV (implémenté dans Settings)
- [x] Guide utilisateur complet (GUIDE_UTILISATEUR.md)
- [ ] Changelog V1
- [x] Documentation des nouvelles fonctionnalités (Dettes, Revenus/Dépenses, Balance, Cron, Catégories)

---

Notes de validation rapide:
- Architecture actuelle: saine pour un scale small/medium (Vercel + Convex). Pour un scale supérieur: déplacer agrégations au backend, ajouter observabilité et limiter les requêtes.
- Thème: priorité à une palette accessible, densité contrôlée, cohérence visuelle, et QA RTL/mobile.
