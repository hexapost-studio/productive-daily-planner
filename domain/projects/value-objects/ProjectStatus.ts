export const PROJECT_STATUSES = ['En attente', 'En cours', 'Terminé', 'Annulé', 'En pause'] as const
export type ProjectStatus = typeof PROJECT_STATUSES[number]
