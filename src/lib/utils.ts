import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, isToday, parseISO, differenceInDays } from 'date-fns'

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'yyyy-MM-dd')
}

export function formatDisplayDate(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'MMM d, yyyy')
}

export function getToday(): string {
  return format(new Date(), 'yyyy-MM-dd')
}

export function getWeekDates(date: Date = new Date()): string[] {
  const start = startOfWeek(date, { weekStartsOn: 1 })
  const end = endOfWeek(date, { weekStartsOn: 1 })
  return eachDayOfInterval({ start, end }).map(d => format(d, 'yyyy-MM-dd'))
}

export function getMonthDates(date: Date = new Date()): string[] {
  const start = startOfMonth(date)
  const end = endOfMonth(date)
  return eachDayOfInterval({ start, end }).map(d => format(d, 'yyyy-MM-dd'))
}

export function isDayToday(dateStr: string): boolean {
  return isToday(parseISO(dateStr))
}

export function calculateStreak(logs: { date: string }[]): number {
  if (logs.length === 0) return 0
  const sorted = [...logs].sort((a, b) => b.date.localeCompare(a.date))
  const today = getToday()
  let streak = 0
  let currentDate = today

  for (const log of sorted) {
    const diff = differenceInDays(parseISO(currentDate), parseISO(log.date))
    if (diff === 0) {
      streak++
      currentDate = format(
        new Date(parseISO(log.date).getTime() - 86400000),
        'yyyy-MM-dd'
      )
    } else if (diff === 1 && streak === 0) {
      streak++
      currentDate = format(
        new Date(parseISO(log.date).getTime() - 86400000),
        'yyyy-MM-dd'
      )
    } else {
      break
    }
  }
  return streak
}

export function getHeatmapColor(value: number, max: number): string {
  if (value === 0) return '#ebedf0'
  const ratio = value / max
  if (ratio <= 0.25) return '#9be9a8'
  if (ratio <= 0.5) return '#40c463'
  if (ratio <= 0.75) return '#30a14e'
  return '#216e39'
}

export function getDayOfWeek(dateStr: string): string {
  return format(parseISO(dateStr), 'EEE')
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

export const HABIT_COLORS = [
  '#0ea5e9', '#8b5cf6', '#ec4899', '#f59e0b',
  '#22c55e', '#ef4444', '#06b6d4', '#f97316',
  '#6366f1', '#14b8a6', '#e11d48', '#84cc16',
]

export const HABIT_ICONS = [
  'heart', 'star', 'zap', 'sun', 'moon', 'cloud',
  'droplet', 'flame', 'target', 'book', 'music',
  'coffee', 'dumbbell', 'brain', 'smile', 'clock',
  'pen', 'camera', 'bike', 'leaf',
]

export const MOOD_EMOJIS = ['😢', '😕', '😐', '🙂', '😄']
export const MOOD_LABELS = ['Terrible', 'Bad', 'Okay', 'Good', 'Great']
