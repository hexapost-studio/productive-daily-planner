export const TASK_STATUSES = ['À faire', 'En cours', 'Fait'] as const
export type TaskStatus = typeof TASK_STATUSES[number]
