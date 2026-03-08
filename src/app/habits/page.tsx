'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Plus, Check, X, Edit2, Trash2, MoreVertical,
  Flame, Calendar, Circle
} from 'lucide-react'
import { cn, getToday, getWeekDates, HABIT_COLORS, getDayOfWeek } from '@/lib/utils'
import { format, parseISO } from 'date-fns'

interface HabitLog {
  id: string
  habitId: string
  date: string
  value: number
  note: string | null
}

interface Habit {
  id: string
  name: string
  description: string | null
  icon: string
  color: string
  frequency: string
  targetCount: number
  unit: string | null
  reminderTime: string | null
  reminderDays: string | null
  category: string
  archived: boolean
  logs: HabitLog[]
}

export default function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null)
  const [menuOpen, setMenuOpen] = useState<string | null>(null)

  const today = getToday()
  const weekDates = getWeekDates()

  const fetchHabits = useCallback(async () => {
    const res = await fetch('/api/habits')
    const data = await res.json()
    setHabits(data)
    setLoading(false)
  }, [])

  useEffect(() => { fetchHabits() }, [fetchHabits])

  const toggleLog = async (habitId: string, date: string) => {
    const habit = habits.find(h => h.id === habitId)
    if (!habit) return
    const hasLog = habit.logs.some(l => l.date === date)

    if (hasLog) {
      await fetch(`/api/habits/log?habitId=${habitId}&date=${date}`, { method: 'DELETE' })
    } else {
      await fetch('/api/habits/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ habitId, date, value: 1 }),
      })
    }
    fetchHabits()
  }

  const deleteHabit = async (id: string) => {
    if (!confirm('Delete this habit and all its logs?')) return
    await fetch(`/api/habits/${id}`, { method: 'DELETE' })
    setMenuOpen(null)
    fetchHabits()
  }

  const getStreak = (habit: Habit): number => {
    const sorted = [...habit.logs].sort((a, b) => b.date.localeCompare(a.date))
    if (sorted.length === 0) return 0
    let streak = 0
    let checkDate = today
    for (const log of sorted) {
      if (log.date === checkDate) {
        streak++
        const d = new Date(checkDate + 'T00:00:00')
        d.setDate(d.getDate() - 1)
        checkDate = format(d, 'yyyy-MM-dd')
      } else if (streak === 0) {
        const d = new Date(today + 'T00:00:00')
        d.setDate(d.getDate() - 1)
        const yesterday = format(d, 'yyyy-MM-dd')
        if (log.date === yesterday) {
          streak++
          checkDate = format(new Date(new Date(yesterday + 'T00:00:00').getTime() - 86400000), 'yyyy-MM-dd')
        } else {
          break
        }
      } else {
        break
      }
    }
    return streak
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-slate-400">Loading habits...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Habits</h1>
          <p className="text-slate-500 mt-1">Track your daily routines</p>
        </div>
        <button
          onClick={() => { setEditingHabit(null); setShowForm(true) }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={18} />
          <span className="hidden sm:inline">New Habit</span>
        </button>
      </div>

      {/* Week View Header */}
      <div className="card overflow-hidden">
        <div className="grid grid-cols-[1fr_repeat(7,40px)] sm:grid-cols-[1fr_repeat(7,48px)] gap-1 p-4 bg-slate-50 border-b border-slate-100">
          <div className="text-sm font-medium text-slate-500">Habit</div>
          {weekDates.map(date => (
            <div key={date} className="text-center">
              <div className="text-[10px] text-slate-400 uppercase">{getDayOfWeek(date)}</div>
              <div className={cn(
                'text-xs font-medium mt-0.5',
                date === today ? 'text-primary-600' : 'text-slate-600'
              )}>
                {format(parseISO(date), 'd')}
              </div>
            </div>
          ))}
        </div>

        {habits.length === 0 ? (
          <div className="p-8 text-center">
            <Circle size={40} className="text-slate-200 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">No habits yet. Create your first one!</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {habits.map(habit => (
              <div key={habit.id} className="grid grid-cols-[1fr_repeat(7,40px)] sm:grid-cols-[1fr_repeat(7,48px)] gap-1 p-3 sm:p-4 items-center hover:bg-slate-50/50 transition-colors">
                <div className="flex items-center gap-3 min-w-0 relative">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: habit.color }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-900 truncate">{habit.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Flame size={12} className="text-orange-400" />
                      <span className="text-xs text-slate-500">{getStreak(habit)} day streak</span>
                    </div>
                  </div>
                  <div className="relative">
                    <button
                      onClick={() => setMenuOpen(menuOpen === habit.id ? null : habit.id)}
                      className="p-1 hover:bg-slate-100 rounded-lg opacity-0 group-hover:opacity-100 sm:opacity-100"
                    >
                      <MoreVertical size={14} className="text-slate-400" />
                    </button>
                    {menuOpen === habit.id && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(null)} />
                        <div className="absolute right-0 top-8 z-20 bg-white border border-slate-200 rounded-xl shadow-lg py-1 w-36">
                          <button
                            onClick={() => { setEditingHabit(habit); setShowForm(true); setMenuOpen(null) }}
                            className="w-full px-3 py-2 text-sm text-left hover:bg-slate-50 flex items-center gap-2"
                          >
                            <Edit2 size={14} /> Edit
                          </button>
                          <button
                            onClick={() => deleteHabit(habit.id)}
                            className="w-full px-3 py-2 text-sm text-left hover:bg-red-50 text-red-600 flex items-center gap-2"
                          >
                            <Trash2 size={14} /> Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                {weekDates.map(date => {
                  const hasLog = habit.logs.some(l => l.date === date)
                  const isToday = date === today
                  return (
                    <button
                      key={date}
                      onClick={() => toggleLog(habit.id, date)}
                      className={cn(
                        'w-8 h-8 sm:w-10 sm:h-10 rounded-lg mx-auto flex items-center justify-center transition-all duration-200',
                        hasLog
                          ? 'text-white shadow-sm'
                          : isToday
                            ? 'bg-slate-100 hover:bg-slate-200 border-2 border-dashed border-slate-300'
                            : 'bg-slate-50 hover:bg-slate-100'
                      )}
                      style={hasLog ? { backgroundColor: habit.color } : {}}
                    >
                      {hasLog && <Check size={16} strokeWidth={3} />}
                    </button>
                  )
                })}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Habit Form Modal */}
      {showForm && (
        <HabitForm
          habit={editingHabit}
          onClose={() => { setShowForm(false); setEditingHabit(null) }}
          onSave={() => { setShowForm(false); setEditingHabit(null); fetchHabits() }}
        />
      )}
    </div>
  )
}

function HabitForm({ habit, onClose, onSave }: {
  habit: Habit | null
  onClose: () => void
  onSave: () => void
}) {
  const [name, setName] = useState(habit?.name || '')
  const [description, setDescription] = useState(habit?.description || '')
  const [color, setColor] = useState(habit?.color || HABIT_COLORS[0])
  const [frequency, setFrequency] = useState(habit?.frequency || 'daily')
  const [targetCount, setTargetCount] = useState(habit?.targetCount || 1)
  const [unit, setUnit] = useState(habit?.unit || '')
  const [category, setCategory] = useState(habit?.category || 'general')
  const [reminderTime, setReminderTime] = useState(habit?.reminderTime || '')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)

    const data = {
      name: name.trim(),
      description: description.trim() || null,
      color,
      frequency,
      targetCount,
      unit: unit.trim() || null,
      category,
      reminderTime: reminderTime || null,
    }

    if (habit) {
      await fetch(`/api/habits/${habit.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
    } else {
      await fetch('/api/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
    }
    setSaving(false)
    onSave()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="p-5 border-b border-slate-100">
          <h2 className="text-lg font-semibold">{habit ? 'Edit Habit' : 'New Habit'}</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="label">Name *</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              className="input"
              placeholder="e.g., Drink Water, Exercise..."
              autoFocus
            />
          </div>

          <div>
            <label className="label">Description</label>
            <input
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="input"
              placeholder="Optional description"
            />
          </div>

          <div>
            <label className="label">Color</label>
            <div className="flex flex-wrap gap-2">
              {HABIT_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={cn(
                    'w-8 h-8 rounded-full transition-all',
                    color === c ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : 'hover:scale-105'
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Frequency</label>
              <select
                value={frequency}
                onChange={e => setFrequency(e.target.value)}
                className="input"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            <div>
              <label className="label">Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="input"
              >
                <option value="general">General</option>
                <option value="health">Health</option>
                <option value="fitness">Fitness</option>
                <option value="mindfulness">Mindfulness</option>
                <option value="productivity">Productivity</option>
                <option value="learning">Learning</option>
                <option value="social">Social</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Daily Target</label>
              <input
                type="number"
                min={1}
                value={targetCount}
                onChange={e => setTargetCount(Number(e.target.value))}
                className="input"
              />
            </div>
            <div>
              <label className="label">Unit</label>
              <input
                value={unit}
                onChange={e => setUnit(e.target.value)}
                className="input"
                placeholder="e.g., glasses, minutes"
              />
            </div>
          </div>

          <div>
            <label className="label">Reminder Time</label>
            <input
              type="time"
              value={reminderTime}
              onChange={e => setReminderTime(e.target.value)}
              className="input"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={saving || !name.trim()} className="btn-primary flex-1">
              {saving ? 'Saving...' : habit ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
