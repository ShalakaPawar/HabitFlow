'use client'

import { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn, MOOD_EMOJIS, MOOD_LABELS, getToday } from '@/lib/utils'
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  addMonths, subMonths, getDay, parseISO
} from 'date-fns'

interface MoodEntry {
  id: string
  date: string
  mood: number
  energy: number | null
  note: string | null
}

const MOOD_COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#10b981']

export default function MoodPage() {
  const [entries, setEntries] = useState<MoodEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [todayMood, setTodayMood] = useState<number | null>(null)
  const [todayEnergy, setTodayEnergy] = useState<number | null>(null)
  const [todayNote, setTodayNote] = useState('')
  const [saving, setSaving] = useState(false)

  const today = getToday()
  const month = format(currentDate, 'yyyy-MM')

  const fetchMoods = useCallback(async () => {
    const res = await fetch(`/api/mood?month=${month}`)
    const data = await res.json()
    setEntries(data)

    const todayEntry = data.find((e: MoodEntry) => e.date === today)
    if (todayEntry) {
      setTodayMood(todayEntry.mood)
      setTodayEnergy(todayEntry.energy)
      setTodayNote(todayEntry.note || '')
    }
    setLoading(false)
  }, [month, today])

  useEffect(() => { fetchMoods() }, [fetchMoods])

  const saveMood = async (mood: number) => {
    setSaving(true)
    setTodayMood(mood)
    await fetch('/api/mood', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: today, mood, energy: todayEnergy, note: todayNote }),
    })
    setSaving(false)
    fetchMoods()
  }

  const saveEnergy = async (energy: number) => {
    if (!todayMood) return
    setSaving(true)
    setTodayEnergy(energy)
    await fetch('/api/mood', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: today, mood: todayMood, energy, note: todayNote }),
    })
    setSaving(false)
    fetchMoods()
  }

  const saveNote = async () => {
    if (!todayMood) return
    await fetch('/api/mood', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: today, mood: todayMood, energy: todayEnergy, note: todayNote }),
    })
    fetchMoods()
  }

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })
  const startDay = getDay(monthStart)

  const getMoodForDate = (dateStr: string) => entries.find(e => e.date === dateStr)

  // Stats
  const avgMood = entries.length > 0
    ? (entries.reduce((sum, e) => sum + e.mood, 0) / entries.length).toFixed(1)
    : '-'

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-slate-400">Loading mood tracker...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Mood Tracker</h1>
        <p className="text-slate-500 mt-1">How are you feeling today?</p>
      </div>

      {/* Today's Mood */}
      <div className="card p-6">
        <h2 className="font-semibold text-slate-900 mb-4">Today&apos;s Mood</h2>
        <div className="flex items-center justify-center gap-4 sm:gap-6">
          {MOOD_EMOJIS.map((emoji, i) => (
            <button
              key={i}
              onClick={() => saveMood(i + 1)}
              className={cn(
                'flex flex-col items-center gap-2 p-3 rounded-2xl transition-all',
                todayMood === i + 1
                  ? 'bg-slate-100 scale-110 ring-2 ring-offset-2'
                  : 'hover:bg-slate-50 hover:scale-105'
              )}
              style={todayMood === i + 1 ? { borderColor: MOOD_COLORS[i] } : {}}
            >
              <span className="text-3xl sm:text-4xl">{emoji}</span>
              <span className="text-xs text-slate-500">{MOOD_LABELS[i]}</span>
            </button>
          ))}
        </div>

        {todayMood && (
          <div className="mt-6 space-y-4">
            {/* Energy Level */}
            <div>
              <label className="label">Energy Level</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(level => (
                  <button
                    key={level}
                    onClick={() => saveEnergy(level)}
                    className={cn(
                      'flex-1 py-2 rounded-xl text-sm font-medium transition-all',
                      todayEnergy === level
                        ? 'bg-amber-100 text-amber-700 ring-2 ring-amber-300'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                    )}
                  >
                    {'⚡'.repeat(level)}
                  </button>
                ))}
              </div>
            </div>

            {/* Note */}
            <div>
              <label className="label">Note (optional)</label>
              <textarea
                value={todayNote}
                onChange={e => setTodayNote(e.target.value)}
                onBlur={saveNote}
                className="input min-h-[60px] resize-y"
                placeholder="What's on your mind?"
              />
            </div>
          </div>
        )}
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
            const entry = getMoodForDate(dateStr)
            const isToday = dateStr === today

            return (
              <div
                key={dateStr}
                className={cn(
                  'aspect-square rounded-lg flex items-center justify-center relative group',
                  isToday && 'ring-2 ring-primary-400 ring-offset-1'
                )}
                style={entry ? { backgroundColor: MOOD_COLORS[entry.mood - 1] + '30' } : {}}
              >
                {entry ? (
                  <span className="text-lg">{MOOD_EMOJIS[entry.mood - 1]}</span>
                ) : (
                  <span className="text-xs text-slate-400">{format(day, 'd')}</span>
                )}
                {entry?.note && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                    <div className="bg-slate-900 text-white text-xs rounded-lg px-2.5 py-1.5 max-w-[200px]">
                      {entry.note}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-slate-900">{avgMood}</p>
          <p className="text-xs text-slate-500 mt-1">Avg Mood</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-slate-900">{entries.length}</p>
          <p className="text-xs text-slate-500 mt-1">Days Logged</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-slate-900">
            {entries.filter(e => e.mood >= 4).length}
          </p>
          <p className="text-xs text-slate-500 mt-1">Good Days</p>
        </div>
      </div>
    </div>
  )
}
