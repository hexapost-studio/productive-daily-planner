# Cahier des Charges — Productive Daily Planner

## Vision produit

Transformer le fichier Excel "PRODUCTIVE DAILY PLANNER 2025" en une application web moderne, interactive et fluide. L'objectif est de conserver toute la logique métier du planificateur tout en offrant une expérience utilisateur supérieure : interface dark, navigation rapide, persistance automatique.

## Utilisateurs cibles

Toute personne utilisant le Productive Daily Planner Excel de Christian Saboukoulou / CSMedias :
- Entrepreneurs et freelances gérant plusieurs projets
- Managers planifiant leurs semaines et équipes
- Étudiants et professionnels en quête de productivité structurée

## Fonctionnalités

### F1 — Configuration initiale
- F1.1 : Saisie du nom utilisateur
- F1.2 : Définition de la date de démarrage du planificateur (dernier lundi de l'année précédente)
- F1.3 : Définition de jusqu'à 25 types de projets avec nom et couleur
- F1.4 : Définition des tâches récurrentes par jour de la semaine (5 max par jour)

### F2 — Planificateur quotidien
- F2.1 : Visualisation du planning du jour avec toutes ses tâches
- F2.2 : Ajout, édition, suppression de tâches (max 25/jour)
- F2.3 : Chaque tâche : désignation, domaine, priorité (P1-P4), temps estimé (min), temps réel (min), statut, remarques
- F2.4 : Statuts : "À faire" / "En cours" / "Fait"
- F2.5 : Calcul automatique du temps total estimé et du temps restant
- F2.6 : Barre de progression du jour (% tâches complétées)
- F2.7 : Injection automatique des tâches récurrentes lors de la création d'un nouveau jour
- F2.8 : Navigation ← → entre les jours

### F3 — Planificateur hebdomadaire
- F3.1 : Vue semaine sur 7 colonnes (Lundi à Dimanche)
- F3.2 : Liste des tâches principales de la semaine (max 22) avec désignation, domaine, priorité
- F3.3 : Résumé compact de chaque journée dans la vue semaine
- F3.4 : Métriques par journée : temps estimé total, nombre de tâches
- F3.5 : Navigation entre les semaines

### F4 — Vue mensuelle (calendrier)
- F4.1 : Grille calendrier du mois sélectionné
- F4.2 : Indicateurs par jour : nombre de tâches, progression
- F4.3 : Sélecteur mois/année
- F4.4 : Clic sur un jour pour accéder au planificateur quotidien
- F4.5 : Clic sur une semaine pour accéder au planificateur hebdomadaire

### F5 — Project Board
- F5.1 : Tableau de tous les projets (max 100)
- F5.2 : Colonnes : #, désignation, type, priorité, niveau d'impact, date début, deadline, état, avancement (%), personnes clés, commentaires
- F5.3 : Ajout, édition inline, suppression de projets
- F5.4 : Filtres par type, statut, priorité
- F5.5 : Tri par colonne
- F5.6 : Barre de progression visuelle par projet

## Règles métier

- Une semaine commence le lundi (ISO 8601)
- weekId format : `YYYY-WNN` (ex: `2025-W01`)
- Maximum 25 tâches par jour
- Maximum 22 tâches principales par semaine
- Maximum 5 tâches récurrentes par jour de la semaine
- Maximum 25 types de projets
- Maximum 100 projets dans le board
- Les tâches récurrentes sont automatiquement ajoutées au plan du jour lors de sa première ouverture
- Le temps restant = somme des temps estimés des tâches "À faire" et "En cours"
- Un projet a un avancement de 0 à 100%
- Statuts projet : En attente / En cours / Terminé / Annulé / En pause
- Niveaux d'impact projet : Fort / Moyen / Faible

## Ergonomie Mobile-First

L'application est conçue **mobile d'abord**. Chaque écran est pensé pour un usage tactile sur iPhone/Android avant d'être adapté desktop.

### Principes fondamentaux

- **Touch targets ≥ 44×44px** sur tous les éléments interactifs (boutons, liens, icônes)
- **Font size ≥ 16px** sur tous les inputs/select pour éviter le zoom automatique iOS
- **Safe area iOS** : `env(safe-area-inset-bottom)` appliqué sur la bottom nav et le contenu principal
- **Navigation bottom** sur mobile, sidebar fixe sur desktop (`md:flex`)
- **Pas de hover-only** : toutes les actions doivent être accessibles au tap

### Navigation

- **Mobile** : Bottom nav fixe 4 tabs (Accueil / Planner / Projets / Params), hauteur 64px + safe area
- **Desktop** : Sidebar fixe 240px à gauche, toujours visible
- **TopBar mobile** : hamburger à gauche, titre centré, zone droite symétrique pour équilibre visuel
- **Sidebar overlay** : s'ouvre sur swipe/tap hamburger, fond semi-transparent cliquable pour fermer

### Navigation temporelle

- **Swipe gauche/droite** sur la vue journée pour changer de jour (touch gesture natif)
- **Chips scrollables horizontalement** sur la vue semaine (scroll-x avec snap)
- **Calendrier mensuel** : cases avec indicateurs de tâches (dots colorés par priorité, badge count)
- **Navigation ← →** visible et avec touch target ≥ 44px

### Formulaires & saisie

- Selects natifs shadcn/ui adaptés touch
- Champs estimé/réel côte à côte (50%/50%) sur mobile — pas l'un sous l'autre
- Textarea remarques avec `rows=2` minimum pour éviter le scroll interne
- Validation inline, pas de modale de confirmation pour les actions courantes

### Listes & cartes

- **TaskCard** : désignation sur 1 ligne avec expansion au tap, pas de troncature silencieuse
- **Priorité** affichée via bordure gauche colorée (4px) — lecture rapide sans texte
- **Statut** : badge color-coded, tap direct pour changer (pas besoin d'ouvrir un select)
- **Actions secondaires** (focus, supprimer) : icônes visibles mais compactes, ≥ 44px touch
- **FAB "+ Ajouter"** : bouton fixe en bas à droite sur mobile pour ajout rapide

### Vues spécifiques mobile

| Vue | Adaptation mobile |
|-----|-------------------|
| Calendrier mensuel | Grille 7 colonnes lettres initiales, dots tâches par case, semaines masquées |
| Vue semaine | Chips jours scrollables horizontal avec snap, accordéon tâches hebdo |
| Vue journée | Header sticky, swipe j-1/j+1, FAB ajouter |
| Project Board | Filtres dans sheet bottom au lieu de 3 dropdowns côte à côte |
| Settings | Tabs scrollables, formulaires pleine largeur |
| Focus mode | Plein écran, timer SVG centré, un seul bouton CTA |

### Gestes supportés

- Swipe horizontal : navigation jour précédent/suivant (vue journée)
- Tap long : réordonner une tâche (drag & drop)
- Pull-to-refresh : rechargement des données (futur)

### Performance mobile

- Pas d'animation > 300ms sur les transitions de page
- `will-change: transform` uniquement sur les éléments animés
- Images SVG inline (pas de fetch réseau)
- localStorage synchrone — pas de loader visible pour les lectures

---

## Contraintes techniques

- Persistance 100% locale via localStorage (pas de backend, pas d'authentification)
- Application fonctionnelle hors-ligne
- **Mobile-first** : conçu pour 390px (iPhone 14), adapté desktop ≥ 768px
- Dark mode natif (pas de toggle)
- Zéro dépendance backend
- Build statique exportable
- TypeScript strict (pas de `any`)

## Architecture

Voir `docs/architecture-ddd.md`
