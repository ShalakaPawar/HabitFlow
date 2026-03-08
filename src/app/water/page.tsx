'use client'

import { useState, useEffect, useCallback } from 'react'
import { Droplets, Plus, Minus, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn, getToday } from '@/lib/utils'
import { format, subMonths, addMonths, startOfMonth, endOfMonth, eachDayOfInterval, getDay } from 'date-fns'

interface WaterLog {
  id?: string
  date: string
  glasses: number
  target: number
}

export default function WaterPage() {
  const [todayLog, setTodayLog] = useState<WaterLog>({ date: getToday(), glasses: 0, target: 8 })
  const [monthLogs, setMonthLogs] = useState<WaterLog[]>([])
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())

  const today = getToday()
  const month = format(currentDate, 'yyyy-MM')

  const fetchData = useCallback(async () => {
    const [todayRes, monthRes] = await Promise.all([
      fetch(`/api/water?date=${today}`),
      fetch(`/api/water?month=${month}`),
    ])
    const todayData = await todayRes.json()
    const monthData = await monthRes.json()
    setTodayLog(todayData)
    setMonthLogs(Array.isArray(monthData) ? monthData : [])
    setLoading(false)
  }, [today, month])

  useEffect(() => { fetchData() }, [fetchData])

  const updateGlasses = async (delta: number) => {
    const newGlasses = Math.max(0, todayLog.glasses + delta)
    setTodayLog({ ...todayLog, glasses: newGlasses })
    await fetch('/api/water', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: today, glasses: newGlasses, target: todayLog.target }),
    })
    fetchData()
  }

  const percentage = Math.min(100, Math.round((todayLog.glasses / todayLog.target) * 100))

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })
  const startDay = getDay(monthStart)

  const getLogForDate = (dateStr: string) => monthLogs.find(l => l.date === dateStr)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-slate-400">Loading water tracker...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Water Intake</h1>
        <p className="text-slate-500 mt-1">Stay hydrated throughout the day</p>
      </div>

      {/* Today's Water */}
      <div className="card p-6">
        <h2 className="font-semibold text-slate-900 mb-6 text-center">Today&apos;s Intake</h2>

        {/* Circular Progress */}
        <div className="flex flex-col items-center">
          <div className="relative w-48 h-48">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50" cy="50" r="42"
                fill="none" stroke="#e2e8f0" strokeWidth="8"
              />
              <circle
                cx="50" cy="50" r="42"
                fill="none" stroke="#06b6d4" strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 42}`}
                strokeDashoffset={`${2 * Math.PI * 42 * (1 - percentage / 100)}`}
                className="transition-all duration-500"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Droplets size={24} className="text-cyan-500 mb-1" />
              <span className="text-3xl font-bold text-slate-900">{todayLog.glasses}</span>
              <span className="text-sm text-slate-500">of {todayLog.target} glasses</span>
            </div>
          </div>

          <div className="flex items-center gap-4 mt-6">
            <button
              onClick={() => updateGlasses(-1)}
              className="w-12 h-12 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
              disabled={todayLog.glasses === 0}
            >
              <Minus size={20} className="text-slate-600" />
            </button>
            <button
              onClick={() => updateGlasses(1)}
              className="w-14 h-14 rounded-full bg-cyan-500 hover:bg-cyan-600 flex items-center justify-center transition-colors shadow-lg shadow-cyan-500/30"
            >
              <Plus size={24} className="text-white" />
            </button>
            <button
              onClick={() => updateGlasses(-1)}
              className="w-12 h-12 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors invisible"
            >
              <Minus size={20} />
            </button>
          </div>

          {percentage >= 100 && (
            <p className="mt-4 text-emerald-600 font-medium text-sm">
              🎉 You hit your water goal today!
            </p>
          )}
        </div>

        {/* Glass indicators */}
        <div className="flex flex-wrap justify-center gap-2 mt-6">
          {Array.from({ length: todayLog.target }).map((_, i) => (
            <button
              key={i}
              onClick={() => {
                const newGlasses = i + 1
                setTodayLog({ ...todayLog, glasses: newGlasses })
                fetch('/api/water', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ date: today, glasses: newGlasses, target: todayLog.target }),
                }).then(() => fetchData())
              }}
              className={cn(
                'w-8 h-10 rounded-lg transition-all',
                i < todayLog.glasses
                  ? 'bg-cyan-400 shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200'
              )}
            >
              <Droplets size={14} className={cn(
                'mx-auto',
                i < todayLog.glasses ? 'text-white' : 'text-slate-300'
              )} />
            </button>
          ))}
        </div>
      </div>

      {/* Monthly Calendar */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="p-2 hover:bg-slate-100 rounded-lg">
            <ChevronLeft size={18} />
          </button>
          <h3 className="font-semibold text-slate-900">{format(currentDate, 'MMMM yyyy')}</h3>
          <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-2 hover:bg-slate-100 rounded-lg">
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
            <div key={i} className="text-center text-xs font-medium text-slate-400 py-1">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: startDay }).map((_, i) => (
            <div key={`e-${i}`} className="aspect-square" />
          ))}
          {days.map(day => {
            const dateStr = format(day, 'yyyy-MM-dd')
            const log = getLogForDate(dateStr)
            const pct = log ? Math.min(100, Math.round((log.glasses / log.target) * 100)) : 0
            const isToday = dateStr === today

            return (
              <div
                key={dateStr}
                className={cn(
                  'aspect-square rounded-lg flex flex-col items-center justify-center text-xs relative',
                  isToday && 'ring-2 ring-cyan-400 ring-offset-1',
                  pct >= 100 ? 'bg-cyan-100' : pct > 0 ? 'bg-cyan-50' : 'bg-slate-50'
                )}
              >
                <span className={cn(
                  'font-medium',
                  pct >= 100 ? 'text-cyan-700' : 'text-slate-500'
                )}>
                  {format(day, 'd')}
                </span>
                {log && log.glasses > 0 && (
                  <span className="text-[9px] text-cyan-600">{log.glasses}💧</span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-slate-900">
            {monthLogs.reduce((sum, l) => sum + l.glasses, 0)}
          </p>
          <p className="text-xs text-slate-500 mt-1">Total Glasses</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-slate-900">
            {monthLogs.filter(l => l.glasses >= l.target).length}
          </p>
          <p className="text-xs text-slate-500 mt-1">Goals Met</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-slate-900">
            {monthLogs.length > 0
              ? Math.round(monthLogs.reduce((sum, l) => sum + l.glasses, 0) / monthLogs.length)
              : 0}
          </p>
          <p className="text-xs text-slate-500 mt-1">Daily Avg</p>
        </div>
      </div>
    </div>
  )
}
