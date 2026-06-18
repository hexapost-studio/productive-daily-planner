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
  'À faire': '#374151',
  'En cours': '#1d4ed8',
  'Fait': '#065f46',
}

export const PRIORITY_COLORS: Record<string, string> = {
  'P1 - Critique': '#ef4444',
  'P2 - Haute': '#f97316',
  'P3 - Normale': '#6366f1',
  'P4 - Basse': '#6b7280',
}

export const IMPACT_COLORS: Record<string, string> = {
  'Fort': '#7c3aed',
  'Moyen': '#6366f1',
  'Faible': '#4b5563',
}

export const PROJECT_STATUS_COLORS: Record<string, string> = {
  'En attente': '#6b7280',
  'En cours': '#1d4ed8',
  'Terminé': '#065f46',
  'Annulé': '#7f1d1d',
  'En pause': '#92400e',
}
