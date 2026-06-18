export const PRIORITIES = ['P1 - Critique', 'P2 - Haute', 'P3 - Normale', 'P4 - Basse'] as const
export type Priority = typeof PRIORITIES[number]
