import {
  format,
  getISOWeek,
  startOfISOWeek,
  addDays,
  parseISO,
  getYear,
  isToday,
  isSameMonth,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
} from 'date-fns'
import { fr } from 'date-fns/locale'

export function getWeekId(date: Date): string {
  const monday = startOfISOWeek(date)
  const year = getYear(monday)
  const week = getISOWeek(date)
  return `${year}-W${String(week).padStart(2, '0')}`
}

export function parseWeekId(weekId: string): { year: number; week: number } {
  const [year, w] = weekId.split('-W')
  return { year: parseInt(year, 10), week: parseInt(w, 10) }
}

export function getWeekDates(weekId: string): Date[] {
  const { year, week } = parseWeekId(weekId)
  const jan4 = new Date(year, 0, 4)
  const firstMonday = startOfISOWeek(jan4)
  const weekStart = addDays(firstMonday, (week - 1) * 7)
  return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
}

export function formatDateISO(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

export function formatDateFR(dateStr: string): string {
  return format(parseISO(dateStr), 'EEEE d MMMM yyyy', { locale: fr })
}

export function formatDateShort(dateStr: string): string {
  return format(parseISO(dateStr), 'd MMM', { locale: fr })
}

export function formatDateMedium(dateStr: string): string {
  return format(parseISO(dateStr), 'EEE d MMM', { locale: fr })
}

export function getTodayISO(): string {
  return format(new Date(), 'yyyy-MM-dd')
}

export function getTodayWeekId(): string {
  return getWeekId(new Date())
}

export function isDateToday(dateStr: string): boolean {
  return isToday(parseISO(dateStr))
}

export function getDayOfWeekFR(dateStr: string): string {
  const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
  const d = parseISO(dateStr)
  return days[getDay(d)]
}

export function getMonthCalendarDays(year: number, month: number): (Date | null)[] {
  const firstDay = startOfMonth(new Date(year, month, 1))
  const lastDay = endOfMonth(firstDay)
  const days = eachDayOfInterval({ start: firstDay, end: lastDay })

  const startDow = getDay(firstDay)
  const offset = startDow === 0 ? 6 : startDow - 1

  const result: (Date | null)[] = Array(offset).fill(null)
  days.forEach((d) => result.push(d))

  while (result.length % 7 !== 0) result.push(null)
  return result
}

export function isSameMonthCheck(date: Date, year: number, month: number): boolean {
  return isSameMonth(date, new Date(year, month, 1))
}

export function prevDay(dateStr: string): string {
  const d = parseISO(dateStr)
  return formatDateISO(addDays(d, -1))
}

export function nextDay(dateStr: string): string {
  const d = parseISO(dateStr)
  return formatDateISO(addDays(d, 1))
}

export function prevWeekId(weekId: string): string {
  const dates = getWeekDates(weekId)
  return getWeekId(addDays(dates[0], -7))
}

export function nextWeekId(weekId: string): string {
  const dates = getWeekDates(weekId)
  return getWeekId(addDays(dates[0], 7))
}

export function formatMonthYear(year: number, month: number): string {
  return format(new Date(year, month, 1), 'MMMM yyyy', { locale: fr })
}
