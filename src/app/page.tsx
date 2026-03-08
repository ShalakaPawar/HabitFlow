'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  CheckCircle2, Flame, Target, TrendingUp,
  Droplets, Heart, ChevronRight, Zap, Calendar
} from 'lucide-react'
import { cn, MOOD_EMOJIS } from '@/lib/utils'

interface DashboardData {
  totalHabits: number
  completedToday: number
  completionRate: number
  bestStreak: number
  totalLogsThisWeek: number
  habitStreaks: { name: string; color: string; streak: number; id: string }[]
  activeGoals: number
  goals: any[]
  todayMood: number | null
  waterGlasses: number
  waterTarget: number
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dashboard')
      .then(r => r.json())
      .then(setData)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-slate-400">Loading dashboard...</div>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-1">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<CheckCircle2 size={20} />}
          label="Completed Today"
          value={`${data.completedToday}/${data.totalHabits}`}
          color="bg-emerald-50 text-emerald-600"
          sub={`${data.completionRate}% done`}
        />
        <StatCard
          icon={<Flame size={20} />}
          label="Best Streak"
          value={`${data.bestStreak} days`}
          color="bg-orange-50 text-orange-600"
          sub="Keep it up!"
        />
        <StatCard
          icon={<Target size={20} />}
          label="Active Goals"
          value={String(data.activeGoals)}
          color="bg-purple-50 text-purple-600"
          sub="In progress"
        />
        <StatCard
          icon={<TrendingUp size={20} />}
          label="This Week"
          value={`${data.totalLogsThisWeek} logs`}
          color="bg-blue-50 text-blue-600"
          sub="Total check-ins"
        />
      </div>

      {/* Quick Actions Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/mood" className="card-hover p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center">
            {data.todayMood ? (
              <span className="text-xl">{MOOD_EMOJIS[data.todayMood - 1]}</span>
            ) : (
              <Heart size={18} className="text-pink-500" />
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-slate-900">
              {data.todayMood ? 'Mood Logged' : 'Log Mood'}
            </p>
            <p className="text-xs text-slate-500">Today</p>
          </div>
        </Link>

        <Link href="/water" className="card-hover p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-50 flex items-center justify-center">
            <Droplets size={18} className="text-cyan-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-900">
              {data.waterGlasses}/{data.waterTarget} glasses
            </p>
            <p className="text-xs text-slate-500">Water intake</p>
          </div>
        </Link>

        <Link href="/habits" className="card-hover p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
            <Zap size={18} className="text-emerald-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-900">Check In</p>
            <p className="text-xs text-slate-500">Log habits</p>
          </div>
        </Link>

        <Link href="/tracker" className="card-hover p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center">
            <Calendar size={18} className="text-violet-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-900">Heatmap</p>
            <p className="text-xs text-slate-500">View progress</p>
          </div>
        </Link>
      </div>

      {/* Habit Streaks + Active Goals */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Habit Streaks */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900">Habit Streaks</h2>
            <Link href="/habits" className="text-sm text-primary-500 hover:text-primary-600 flex items-center gap-1">
              View all <ChevronRight size={14} />
            </Link>
          </div>
          {data.habitStreaks.length === 0 ? (
            <p className="text-sm text-slate-400 py-4 text-center">
              No habits yet. Create your first habit!
            </p>
          ) : (
            <div className="space-y-3">
              {data.habitStreaks.slice(0, 6).map((habit) => (
                <div key={habit.id} className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: habit.color }}
                  />
                  <span className="text-sm text-slate-700 flex-1 truncate">{habit.name}</span>
                  <div className="flex items-center gap-1.5">
                    <Flame size={14} className="text-orange-400" />
                    <span className="text-sm font-medium text-slate-900">{habit.streak}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Active Goals */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900">Active Goals</h2>
            <Link href="/goals" className="text-sm text-primary-500 hover:text-primary-600 flex items-center gap-1">
              View all <ChevronRight size={14} />
            </Link>
          </div>
          {data.goals.length === 0 ? (
            <p className="text-sm text-slate-400 py-4 text-center">
              No active goals. Set one now!
            </p>
          ) : (
            <div className="space-y-3">
              {data.goals.map((goal: any) => (
                <div key={goal.id} className="p-3 bg-slate-50 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-900 truncate">{goal.title}</span>
                    <span className={cn(
                      'badge',
                      goal.priority === 'high' ? 'bg-red-100 text-red-700' :
                      goal.priority === 'medium' ? 'bg-amber-100 text-amber-700' :
                      'bg-green-100 text-green-700'
                    )}>
                      {goal.priority}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-primary-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1.5">
                    {goal.progress}% complete • {goal.tasks?.filter((t: any) => t.completed).length}/{goal.tasks?.length} tasks
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, color, sub }: {
  icon: React.ReactNode; label: string; value: string; color: string; sub: string
}) {
  return (
    <div className="card p-4">
      <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center mb-3', color)}>
        {icon}
      </div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-sm text-slate-500 mt-0.5">{label}</p>
      <p className="text-xs text-slate-400 mt-1">{sub}</p>
    </div>
  )
}
