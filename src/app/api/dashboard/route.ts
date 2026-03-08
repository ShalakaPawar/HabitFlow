import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { format, subDays } from 'date-fns'

export async function GET() {
  try {
    const today = format(new Date(), 'yyyy-MM-dd')
    const weekAgo = format(subDays(new Date(), 7), 'yyyy-MM-dd')

    const [habits, todayLogs, weekLogs, activeGoals, todayMood, todayWater] = await Promise.all([
      prisma.habit.findMany({ where: { archived: false }, include: { logs: true } }),
      prisma.habitLog.findMany({ where: { date: today } }),
      prisma.habitLog.findMany({ where: { date: { gte: weekAgo } } }),
      prisma.goal.findMany({ where: { status: 'active' }, include: { tasks: true } }),
      prisma.moodEntry.findUnique({ where: { date: today } }),
      prisma.waterLog.findUnique({ where: { date: today } }),
    ])

    const totalHabits = habits.length
    const completedToday = todayLogs.length
    const completionRate = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0

    // Calculate streaks
    const habitStreaks = habits.map(habit => {
      const sortedLogs = habit.logs.sort((a, b) => b.date.localeCompare(a.date))
      let streak = 0
      let checkDate = today
      for (const log of sortedLogs) {
        if (log.date === checkDate) {
          streak++
          checkDate = format(subDays(new Date(checkDate + 'T00:00:00'), 1), 'yyyy-MM-dd')
        } else if (log.date === format(subDays(new Date(checkDate + 'T00:00:00'), 1), 'yyyy-MM-dd') && streak === 0) {
          checkDate = log.date
          streak++
          checkDate = format(subDays(new Date(checkDate + 'T00:00:00'), 1), 'yyyy-MM-dd')
        } else {
          break
        }
      }
      return { name: habit.name, color: habit.color, streak, id: habit.id }
    })

    const bestStreak = habitStreaks.reduce((max, h) => Math.max(max, h.streak), 0)
    const totalLogsThisWeek = weekLogs.length

    return NextResponse.json({
      totalHabits,
      completedToday,
      completionRate,
      bestStreak,
      totalLogsThisWeek,
      habitStreaks,
      activeGoals: activeGoals.length,
      goals: activeGoals.slice(0, 3),
      todayMood: todayMood?.mood || null,
      waterGlasses: todayWater?.glasses || 0,
      waterTarget: todayWater?.target || 8,
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch dashboard' }, { status: 500 })
  }
}
