export const MONTHS_FR = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
]

export const DAYS_FR_SHORT = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
export const DAYS_FR_FULL = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']

export const LS_PREFIX = 'pdp_v1_'
export const MAX_TASKS_PER_DAY = 25
export const MAX_WEEKLY_TASKS = 22
export const MAX_RECURRING_PER_DAY = 5
export const MAX_PROJECT_TYPES = 25
export const MAX_PROJECTS = 100

export const PROJECT_TYPE_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f97316',
  '#eab308', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6',
  '#a855f7', '#f43f5e', '#84cc16', '#10b981', '#0ea5e9',
  '#6d28d9', '#d97706', '#dc2626', '#059669', '#0284c7',
  '#7c3aed', '#db2777', '#65a30d', '#0f766e', '#1d4ed8',
]

export const STATUS_COLORS: Record<string, string> = {
  'À faire': '#887364',
  'En cours': '#8d4b00',
  'Fait': '#2d6a4f',
}

export const PRIORITY_COLORS: Record<string, string> = {
  'P1 - Critique': '#ba1a1a',
  'P2 - Haute': '#d97706',
  'P3 - Normale': '#6448b3',
  'P4 - Basse': '#887364',
}

export const IMPACT_COLORS: Record<string, string> = {
  'Fort': '#6448b3',
  'Moyen': '#8d4b00',
  'Faible': '#887364',
}

export const PROJECT_STATUS_COLORS: Record<string, string> = {
  'En attente': '#887364',
  'En cours': '#8d4b00',
  'Terminé': '#2d6a4f',
  'Annulé': '#ba1a1a',
  'En pause': '#d97706',
}
