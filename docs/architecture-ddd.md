# Architecture DDD — Productive Daily Planner

## Bounded Contexts

### 1. Planning Context (Core Domain)
Le cœur du produit. Gère la planification quotidienne et hebdomadaire.

**Aggregate Root : WeeklyPlan**
- WeeklyPlan (aggregate root)
  - weekId: string (YYYY-WNN)
  - mainTasks: Task[] (max 22)
  - dailyPlans: DailyPlan[] (7 jours)
- DailyPlan (entity)
  - date: string (YYYY-MM-DD)
  - tasks: Task[] (max 25)
- Task (entity)
  - id, designation, domain, priority, estimatedMinutes, realMinutes, status, remarks, position, isRecurring

**Value Objects :**
- TaskStatus : "À faire" | "En cours" | "Fait"
- Priority : "P1 - Critique" | "P2 - Haute" | "P3 - Normale" | "P4 - Basse"

**Repository interface :** `IPlanningRepository`
- `getWeeklyPlan(weekId: string): WeeklyPlan`
- `saveWeeklyPlan(plan: WeeklyPlan): void`
- `getAllWeeklyPlans(): WeeklyPlan[]`

### 2. Projects Context (Supporting Domain)
Gère le tableau de bord des projets.

**Aggregate Root : Project**
- Project : id, position, designation, type, priority, impactLevel, startDate, deadline, status, progress, keyPeople, comments

**Entities :**
- ProjectType : id, name, color, position

**Value Objects :**
- ProjectStatus : "En attente" | "En cours" | "Terminé" | "Annulé" | "En pause"
- ImpactLevel : "Fort" | "Moyen" | "Faible"

**Repository interfaces :**
- `IProjectRepository` : CRUD projets
- `IProjectTypeRepository` : CRUD types

### 3. Recurring Tasks Context (Supporting Domain)
Gère les tâches récurrentes par jour de semaine.

**Aggregate Root : RecurringTask**
- RecurringTask : id, dayOfWeek, designation, domain, remarks, position

**Value Objects :**
- DayOfWeek : "Lundi" | "Mardi" | ... | "Dimanche"

**Repository interface :** `IRecurringTaskRepository`

### 4. User Context (Generic Subdomain)
Gère le profil utilisateur.

**Aggregate Root : UserProfile**
- UserProfile : name, plannerStartDate

**Repository interface :** `IUserRepository`

---

## Couche Application

Les use cases orchestrent les domaines sans connaissance de l'infrastructure.

### Planning
- `GetWeeklyPlan` : récupère ou crée un WeeklyPlan, injecte les récurrentes
- `GetDailyPlan` : récupère le DailyPlan d'une date donnée
- `UpsertTask` : crée ou met à jour une tâche dans un DailyPlan ou WeeklyPlan
- `DeleteTask` : supprime une tâche

### Projects
- `GetProjects` : liste tous les projets avec filtres
- `UpsertProject` : crée ou met à jour un projet
- `DeleteProject` : supprime un projet
- `GetProjectTypes` : liste les types de projets
- `UpsertProjectType` : crée ou met à jour un type

### Recurring
- `GetRecurringTasks` : par jour de semaine
- `UpsertRecurringTask` : crée ou met à jour
- `DeleteRecurringTask` : supprime

---

## Couche Infrastructure

Implémentation `localStorage` de toutes les interfaces repo.

- `LocalStoragePlanningRepository`
- `LocalStorageProjectRepository`
- `LocalStorageProjectTypeRepository`
- `LocalStorageRecurringTaskRepository`
- `LocalStorageUserRepository`

Clés localStorage : `pdp_v1_weekly_{weekId}`, `pdp_v1_projects`, `pdp_v1_project_types`, `pdp_v1_recurring`, `pdp_v1_user`

---

## Flux de données

```
UI (React) → Application Use Case → Domain Entity → Infrastructure (localStorage)
                                  ↑
                           Repository Interface
```

## Domain Events (futurs)
- `TaskStatusChanged` : pour métriques/stats
- `ProjectProgressUpdated` : pour dashboard
- `WeeklyPlanCreated` : pour injection récurrentes

---

## Couche Présentation — Mobile-First

### Stratégie de layout

```
< 768px (mobile)          ≥ 768px (desktop)
─────────────────         ──────────────────
TopBar (hamburger)        Sidebar fixe 240px
Contenu plein écran       Contenu flex-1
BottomNav fixe 64px       (pas de bottom nav)
```

### Règles CSS critiques

```css
/* Empêche le zoom iOS sur focus input */
input, select, textarea { font-size: 16px; }

/* Safe area bottom nav */
.bottom-nav-safe { padding-bottom: env(safe-area-inset-bottom, 0px); }

/* Contenu principal décalé sous bottom nav sur mobile */
.main-content-mobile {
  padding-bottom: calc(64px + env(safe-area-inset-bottom, 0px));
}

/* Touch target minimum */
.touch-target { min-height: 44px; min-width: 44px; }
```

### Composants layout

| Composant | Mobile | Desktop |
|-----------|--------|---------|
| `AppShell` | TopBar + BottomNav | Sidebar seule |
| `Sidebar` | Drawer overlay (`translate-x`) | Fixe visible |
| `TopBar` | Affiché (`flex md:hidden`) | Masqué |
| `BottomNav` | Affiché (`flex md:hidden`) | Masqué |

### Patterns par page

**`/planner` (calendrier mensuel)**
- Grille 7 cols, entêtes = lettre initiale (L M M J V S D)
- Colonne Semaine masquée sur mobile (`hidden md:table-cell`)
- Dots colorés dans chaque case : rouge P1, orange P2, indigo P3 (max 3 dots)
- Badge count si > 3 tâches

**`/planner/week/[weekId]` (vue semaine)**
- Chips jours en scroll horizontal avec `scroll-snap-type: x mandatory`
- Chip actif centré automatiquement au focus
- Accordéon tâches hebdo collapsé par défaut

**`/planner/day/[date]` (vue journée)**
- Swipe left/right → `useSwipe` hook sur le conteneur principal
- FAB `+ Ajouter` fixe `bottom-20 right-4` (au-dessus de la bottom nav)
- TaskCard : titre sur 1 ligne, expansion au tap

**`/projects` (board)**
- Filtres Statut + Type affichés, Impact dans un `<Sheet>` bottom
- Bouton "+ Nouveau" toujours visible en haut à droite

**`/focus/[date]/[taskId]` (mode focus)**
- Plein écran, `overscroll-none`, pas de scroll
- Timer SVG centré, boutons Start/Pause/Stop ≥ 56px
