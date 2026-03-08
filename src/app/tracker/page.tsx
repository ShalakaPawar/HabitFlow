'use client'

import { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight, Filter } from 'lucide-react'
import { cn, getHeatmapColor } from '@/lib/utils'
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  addMonths, subMonths, getDay, startOfYear, endOfYear,
  eachMonthOfInterval, parseISO
} from 'date-fns'

interface Habit {
  id: string
  name: string
  color: string
  logs: { date: string; value: number }[]
}

export default function TrackerPage() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedHabit, setSelectedHabit] = useState<string>('all')
  const [view, setView] = useState<'month' | 'year'>('month')

  const fetchHabits = useCallback(async () => {
    const res = await fetch('/api/habits')
    const data = await res.json()
    setHabits(data)
    setLoading(false)
  }, [])

  useEffect(() => { fetchHabits() }, [fetchHabits])

  const getLogsForDate = (dateStr: string): number => {
    if (selectedHabit === 'all') {
      return habits.reduce((sum, h) => {
        const log = h.logs.find(l => l.date === dateStr)
        return sum + (log ? log.value : 0)
      }, 0)
    }
    const habit = habits.find(h => h.id === selectedHabit)
    if (!habit) return 0
    const log = habit.logs.find(l => l.date === dateStr)
    return log ? log.value : 0
  }

  const maxValue = Math.max(
    1,
    ...habits.flatMap(h => h.logs.map(l => l.value)),
    selectedHabit === 'all' ? habits.length : 1
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-slate-400">Loading tracker...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tracker</h1>
          <p className="text-slate-500 mt-1">GitHub-style activity heatmap</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setView('month')}
            className={cn(
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
              view === 'month' ? 'bg-primary-100 text-primary-700' : 'text-slate-500 hover:bg-slate-100'
            )}
          >
            Month
          </button>
          <button
            onClick={() => setView('year')}
            className={cn(
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
              view === 'year' ? 'bg-primary-100 text-primary-700' : 'text-slate-500 hover:bg-slate-100'
            )}
          >
            Year
          </button>
        </div>
      </div>

      {/* Habit Filter */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2">
        <Filter size={16} className="text-slate-400 flex-shrink-0" />
        <button
          onClick={() => setSelectedHabit('all')}
          className={cn(
            'px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
            selectedHabit === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          )}
        >
          All Habits
        </button>
        {habits.map(h => (
          <button
            key={h.id}
            onClick={() => setSelectedHabit(h.id)}
            className={cn(
              'px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
              selectedHabit === h.id ? 'text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            )}
            style={selectedHabit === h.id ? { backgroundColor: h.color } : {}}
          >
            {h.name}
          </button>
        ))}
      </div>

      {view === 'month' ? (
        <MonthView
          currentDate={currentDate}
          onPrev={() => setCurrentDate(subMonths(currentDate, 1))}
          onNext={() => setCurrentDate(addMonths(currentDate, 1))}
          getLogsForDate={getLogsForDate}
          maxValue={maxValue}
          selectedColor={selectedHabit !== 'all' ? habits.find(h => h.id === selectedHabit)?.color : undefined}
        />
      ) : (
        <YearView
          currentDate={currentDate}
          onPrev={() => setCurrentDate(subMonths(currentDate, 12))}
          onNext={() => setCurrentDate(addMonths(currentDate, 12))}
          getLogsForDate={getLogsForDate}
          maxValue={maxValue}
          selectedColor={selectedHabit !== 'all' ? habits.find(h => h.id === selectedHabit)?.color : undefined}
        />
      )}

      {/* Legend */}
      <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
        <span>Less</span>
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
          <div
            key={i}
            className="w-4 h-4 rounded-sm"
            style={{ backgroundColor: ratio === 0 ? '#ebedf0' : getHeatmapColor(ratio * 4, 4) }}
          />
        ))}
        <span>More</span>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-slate-900">
            {habits.reduce((sum, h) => sum + h.logs.length, 0)}
          </p>
          <p className="text-xs text-slate-500 mt-1">Total Check-ins</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-slate-900">{habits.length}</p>
          <p className="text-xs text-slate-500 mt-1">Active Habits</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-slate-900">
            {(() => {
              const month = format(currentDate, 'yyyy-MM')
              return habits.reduce((sum, h) => sum + h.logs.filter(l => l.date.startsWith(month)).length, 0)
            })()}
          </p>
          <p className="text-xs text-slate-500 mt-1">This Month</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-slate-900">
            {(() => {
              const today = format(new Date(), 'yyyy-MM-dd')
              return habits.reduce((sum, h) => sum + (h.logs.some(l => l.date === today) ? 1 : 0), 0)
            })()}
          </p>
          <p className="text-xs text-slate-500 mt-1">Done Today</p>
        </div>
      </div>
    </div>
  )
}

function MonthView({
  currentDate, onPrev, onNext, getLogsForDate, maxValue, selectedColor
}: {
  currentDate: Date
  onPrev: () => void
  onNext: () => void
  getLogsForDate: (date: string) => number
  maxValue: number
  selectedColor?: string
}) {
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })
  const startDay = getDay(monthStart)
  const today = format(new Date(), 'yyyy-MM-dd')

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-5">
        <button onClick={onPrev} className="p-2 hover:bg-slate-100 rounded-lg">
          <ChevronLeft size={18} />
        </button>
        <h3 className="font-semibold text-slate-900">
          {format(currentDate, 'MMMM yyyy')}
        </h3>
        <button onClick={onNext} className="p-2 hover:bg-slate-100 rounded-lg">
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <div key={d} className="text-center text-xs font-medium text-slate-400 py-1">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: startDay }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}
        {days.map(day => {
          const dateStr = format(day, 'yyyy-MM-dd')
          const value = getLogsForDate(dateStr)
          const isToday = dateStr === today
          const color = value > 0
            ? selectedColor || getHeatmapColor(value, maxValue)
            : '#ebedf0'

          return (
            <div
              key={dateStr}
              className={cn(
                'aspect-square rounded-lg flex items-center justify-center text-xs relative group cursor-default transition-all',
                isToday && 'ring-2 ring-primary-400 ring-offset-1'
              )}
              style={{ backgroundColor: color }}
            >
              <span className={cn(
                'font-medium',
                value > 0 ? 'text-white' : 'text-slate-500'
              )}>
                {format(day, 'd')}
              </span>
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                <div className="bg-slate-900 text-white text-xs rounded-lg px-2.5 py-1.5 whitespace-nowrap">
                  {format(day, 'MMM d, yyyy')}: {value} {value === 1 ? 'check-in' : 'check-ins'}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function YearView({
  currentDate, onPrev, onNext, getLogsForDate, maxValue, selectedColor
}: {
  currentDate: Date
  onPrev: () => void
  onNext: () => void
  getLogsForDate: (date: string) => number
  maxValue: number
  selectedColor?: string
}) {
  const yearStart = startOfYear(currentDate)
  const yearEnd = endOfYear(currentDate)
  const allDays = eachDayOfInterval({ start: yearStart, end: yearEnd })
  const today = format(new Date(), 'yyyy-MM-dd')

  // Group by weeks for GitHub-style layout
  const weeks: Date[][] = []
  let currentWeek: Date[] = []

  // Pad start
  const firstDayOfWeek = getDay(yearStart)
  for (let i = 0; i < firstDayOfWeek; i++) {
    currentWeek.push(null as any)
  }

  allDays.forEach(day => {
    currentWeek.push(day)
    if (currentWeek.length === 7) {
      weeks.push(currentWeek)
      currentWeek = []
    }
  })
  if (currentWeek.length > 0) {
    weeks.push(currentWeek)
  }

  const months = eachMonthOfInterval({ start: yearStart, end: yearEnd })

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-5">
        <button onClick={onPrev} className="p-2 hover:bg-slate-100 rounded-lg">
          <ChevronLeft size={18} />
        </button>
        <h3 className="font-semibold text-slate-900">
          {format(currentDate, 'yyyy')}
        </h3>
        <button onClick={onNext} className="p-2 hover:bg-slate-100 rounded-lg">
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[700px]">
          {/* Month labels */}
          <div className="flex mb-1 ml-8">
            {months.map((month, i) => (
              <div key={i} className="text-xs text-slate-400" style={{ width: `${100 / 12}%` }}>
                {format(month, 'MMM')}
              </div>
            ))}
          </div>

          <div className="flex gap-[2px]">
            {/* Day labels */}
            <div className="flex flex-col gap-[2px] mr-1 text-xs text-slate-400">
              <div className="h-[12px]" />
              <div className="h-[12px] flex items-center">M</div>
              <div className="h-[12px]" />
              <div className="h-[12px] flex items-center">W</div>
              <div className="h-[12px]" />
              <div className="h-[12px] flex items-center">F</div>
              <div className="h-[12px]" />
            </div>

            {/* Weeks */}
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-[2px]">
                {week.map((day, di) => {
                  if (!day) return <div key={di} className="w-[12px] h-[12px]" />
                  const dateStr = format(day, 'yyyy-MM-dd')
                  const value = getLogsForDate(dateStr)
                  const color = value > 0
                    ? selectedColor || getHeatmapColor(value, maxValue)
                    : '#ebedf0'
                  const isToday = dateStr === today

                  return (
                    <div
                      key={di}
                      className={cn(
                        'w-[12px] h-[12px] rounded-[2px] group relative cursor-default',
                        isToday && 'ring-1 ring-primary-400'
                      )}
                      style={{ backgroundColor: color }}
                    >
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                        <div className="bg-slate-900 text-white text-xs rounded-lg px-2.5 py-1.5 whitespace-nowrap">
                          {format(day, 'MMM d')}: {value}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
