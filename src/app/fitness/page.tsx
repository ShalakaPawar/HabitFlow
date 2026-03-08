'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Activity, Footprints, Heart, Moon, Flame,
  MapPin, Plus, ChevronLeft, ChevronRight, Watch
} from 'lucide-react'
import { cn, getToday } from '@/lib/utils'
import { format, subMonths, addMonths, startOfMonth, endOfMonth, eachDayOfInterval, getDay, parseISO } from 'date-fns'

interface FitnessEntry {
  id: string
  date: string
  source: string
  steps: number | null
  heartRate: number | null
  sleep: number | null
  calories: number | null
  distance: number | null
}

export default function FitnessPage() {
  const [entries, setEntries] = useState<FitnessEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [showForm, setShowForm] = useState(false)

  const today = getToday()
  const month = format(currentDate, 'yyyy-MM')

  const fetchData = useCallback(async () => {
    const res = await fetch(`/api/fitness?month=${month}`)
    const data = await res.json()
    setEntries(Array.isArray(data) ? data : [])
    setLoading(false)
  }, [month])

  useEffect(() => { fetchData() }, [fetchData])

  const todayEntry = entries.find(e => e.date === today)

  // Monthly stats
  const totalSteps = entries.reduce((sum, e) => sum + (e.steps || 0), 0)
  const totalCalories = entries.reduce((sum, e) => sum + (e.calories || 0), 0)
  const totalDistance = entries.reduce((sum, e) => sum + (e.distance || 0), 0)
  const avgSleep = entries.filter(e => e.sleep).length > 0
    ? (entries.reduce((sum, e) => sum + (e.sleep || 0), 0) / entries.filter(e => e.sleep).length).toFixed(1)
    : '-'
  const avgHeartRate = entries.filter(e => e.heartRate).length > 0
    ? Math.round(entries.reduce((sum, e) => sum + (e.heartRate || 0), 0) / entries.filter(e => e.heartRate).length)
    : '-'

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-slate-400">Loading fitness data...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Fitness</h1>
          <p className="text-slate-500 mt-1">Track your activity & health metrics</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={18} />
          <span className="hidden sm:inline">Log Data</span>
        </button>
      </div>

      {/* Amazfit Notice */}
      <div className="card p-4 bg-gradient-to-r from-slate-900 to-slate-800 text-white">
        <div className="flex items-center gap-3">
          <Watch size={20} className="text-emerald-400" />
          <div>
            <p className="text-sm font-medium">Amazfit Watch Ready</p>
            <p className="text-xs text-slate-400 mt-0.5">
              Use the API endpoint <code className="bg-slate-700 px-1.5 py-0.5 rounded text-emerald-300">POST /api/fitness</code> to sync data from your Amazfit watch via Zepp OS or third-party tools.
            </p>
          </div>
        </div>
      </div>

      {/* Today's Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <StatTile
          icon={<Footprints size={18} />}
          label="Steps"
          value={todayEntry?.steps?.toLocaleString() || '0'}
          color="bg-blue-50 text-blue-600"
        />
        <StatTile
          icon={<Heart size={18} />}
          label="Heart Rate"
          value={todayEntry?.heartRate ? `${todayEntry.heartRate} bpm` : '-'}
          color="bg-red-50 text-red-500"
        />
        <StatTile
          icon={<Moon size={18} />}
          label="Sleep"
          value={todayEntry?.sleep ? `${todayEntry.sleep}h` : '-'}
          color="bg-indigo-50 text-indigo-500"
        />
        <StatTile
          icon={<Flame size={18} />}
          label="Calories"
          value={todayEntry?.calories?.toLocaleString() || '0'}
          color="bg-orange-50 text-orange-500"
        />
        <StatTile
          icon={<MapPin size={18} />}
          label="Distance"
          value={todayEntry?.distance ? `${todayEntry.distance} km` : '-'}
          color="bg-green-50 text-green-500"
        />
      </div>

      {/* Month Navigation */}
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

        {/* Monthly Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4">
          <div className="bg-slate-50 rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-slate-900">{totalSteps.toLocaleString()}</p>
            <p className="text-xs text-slate-500">Total Steps</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-slate-900">{totalCalories.toLocaleString()}</p>
            <p className="text-xs text-slate-500">Total Calories</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-slate-900">{totalDistance.toFixed(1)} km</p>
            <p className="text-xs text-slate-500">Total Distance</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-slate-900">{avgSleep}h</p>
            <p className="text-xs text-slate-500">Avg Sleep</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-slate-900">{avgHeartRate}</p>
            <p className="text-xs text-slate-500">Avg HR</p>
          </div>
        </div>

        {/* Daily log list */}
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {entries.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-4">No fitness data this month.</p>
          ) : (
            entries.map(entry => (
              <div key={entry.id} className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900">
                    {format(parseISO(entry.date), 'EEE, MMM d')}
                  </p>
                  <p className="text-xs text-slate-500">
                    via {entry.source}
                  </p>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-600">
                  {entry.steps && (
                    <span className="flex items-center gap-1">
                      <Footprints size={12} /> {entry.steps.toLocaleString()}
                    </span>
                  )}
                  {entry.sleep && (
                    <span className="flex items-center gap-1">
                      <Moon size={12} /> {entry.sleep}h
                    </span>
                  )}
                  {entry.calories && (
                    <span className="flex items-center gap-1">
                      <Flame size={12} /> {entry.calories}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Manual Entry Form */}
      {showForm && (
        <FitnessForm
          onClose={() => setShowForm(false)}
          onSave={() => { setShowForm(false); fetchData() }}
        />
      )}
    </div>
  )
}

function StatTile({ icon, label, value, color }: {
  icon: React.ReactNode; label: string; value: string; color: string
}) {
  return (
    <div className="card p-4">
      <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center mb-2', color)}>
        {icon}
      </div>
      <p className="text-lg font-bold text-slate-900">{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  )
}

function FitnessForm({ onClose, onSave }: { onClose: () => void; onSave: () => void }) {
  const [date, setDate] = useState(getToday())
  const [steps, setSteps] = useState('')
  const [heartRate, setHeartRate] = useState('')
  const [sleep, setSleep] = useState('')
  const [calories, setCalories] = useState('')
  const [distance, setDistance] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    await fetch('/api/fitness', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date,
        source: 'manual',
        steps: steps ? Number(steps) : null,
        heartRate: heartRate ? Number(heartRate) : null,
        sleep: sleep ? Number(sleep) : null,
        calories: calories ? Number(calories) : null,
        distance: distance ? Number(distance) : null,
      }),
    })
    setSaving(false)
    onSave()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="p-5 border-b border-slate-100">
          <h2 className="text-lg font-semibold">Log Fitness Data</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="label">Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="input" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Steps</label>
              <input type="number" value={steps} onChange={e => setSteps(e.target.value)} className="input" placeholder="e.g., 10000" />
            </div>
            <div>
              <label className="label">Heart Rate (bpm)</label>
              <input type="number" value={heartRate} onChange={e => setHeartRate(e.target.value)} className="input" placeholder="e.g., 72" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Sleep (hours)</label>
              <input type="number" step="0.1" value={sleep} onChange={e => setSleep(e.target.value)} className="input" placeholder="e.g., 7.5" />
            </div>
            <div>
              <label className="label">Calories</label>
              <input type="number" value={calories} onChange={e => setCalories(e.target.value)} className="input" placeholder="e.g., 2000" />
            </div>
          </div>
          <div>
            <label className="label">Distance (km)</label>
            <input type="number" step="0.1" value={distance} onChange={e => setDistance(e.target.value)} className="input" placeholder="e.g., 5.2" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">
              {saving ? 'Saving...' : 'Save Data'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
