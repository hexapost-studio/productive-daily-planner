# Productive Daily Planner

App de productivité quotidienne inspirée du fichier Excel "PRODUCTIVE DAILY PLANNER 2025".

## Stack
- Next.js 16 App Router
- React 19
- TypeScript strict
- Tailwind CSS v4
- shadcn/ui
- date-fns v4
- localStorage (persistence locale, pas de backend)

## Structure DDD
- `domain/` → entités pures, value objects, interfaces repo
- `application/` → use cases
- `infrastructure/` → implémentation localStorage
- `app/` → pages Next.js

## Commandes
- `npm run dev` : dev server
- `npm run build` : build prod
- `npx tsc --noEmit` : typecheck

## Conventions
- Pas de commentaires sauf WHY non-obvious
- Composants en PascalCase, fichiers en kebab-case
- Types stricts, pas de `any`
- Persistance : localStorage avec clé prefix `pdp_v1_`
- Toutes les dates en ISO string `YYYY-MM-DD`
- weekId format : `YYYY-WNN` (ex: `2025-W01`)

## Domaines métier
- **Planning** : WeeklyPlan > DailyPlan > Task
- **Projects** : Project + ProjectType
- **Recurring** : RecurringTask par jour de semaine
- **User** : UserProfile (nom, date démarrage)

## Design
- Dark mode natif (pas de toggle)
- Palette indigo/violet (#6366f1 / #8b5cf6)
- Statuts : "À faire" / "En cours" / "Fait"
- Priorités : P1 Critique / P2 Haute / P3 Normale / P4 Basse
