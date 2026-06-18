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
