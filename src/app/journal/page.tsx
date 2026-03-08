'use client'

import { useState, useEffect, useCallback } from 'react'
import { BookOpen, ChevronLeft, ChevronRight, Save, Sparkles } from 'lucide-react'
import { cn, getToday } from '@/lib/utils'
import { format, subDays, addDays, parseISO } from 'date-fns'

interface JournalEntry {
  id: string
  date: string
  content: string
  gratitude: string | null
  createdAt: string
  updatedAt: string
}

export default function JournalPage() {
  const [selectedDate, setSelectedDate] = useState(getToday())
  const [content, setContent] = useState('')
  const [gratitude, setGratitude] = useState('')
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  const today = getToday()
  const month = format(parseISO(selectedDate), 'yyyy-MM')

  const fetchEntry = useCallback(async () => {
    const res = await fetch(`/api/journal?date=${selectedDate}`)
    const data = await res.json()
    if (data) {
      setContent(data.content || '')
      setGratitude(data.gratitude || '')
    } else {
      setContent('')
      setGratitude('')
    }
  }, [selectedDate])

  const fetchMonthEntries = useCallback(async () => {
    const res = await fetch(`/api/journal?month=${month}`)
    const data = await res.json()
    setEntries(Array.isArray(data) ? data : [])
    setLoading(false)
  }, [month])

  useEffect(() => { fetchEntry() }, [fetchEntry])
  useEffect(() => { fetchMonthEntries() }, [fetchMonthEntries])

  const saveEntry = async () => {
    if (!content.trim() && !gratitude.trim()) return
    setSaving(true)
    await fetch('/api/journal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date: selectedDate,
        content: content.trim(),
        gratitude: gratitude.trim() || null,
      }),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    fetchMonthEntries()
  }

  const goToPrevDay = () => {
    setSelectedDate(format(subDays(parseISO(selectedDate), 1), 'yyyy-MM-dd'))
  }
  const goToNextDay = () => {
    const next = format(addDays(parseISO(selectedDate), 1), 'yyyy-MM-dd')
    if (next <= today) setSelectedDate(next)
  }

  const hasEntry = (dateStr: string) => entries.some(e => e.date === dateStr)
  const isToday = selectedDate === today

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-slate-400">Loading journal...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Journal</h1>
        <p className="text-slate-500 mt-1">Daily reflections & gratitude</p>
      </div>

      {/* Date Navigation */}
      <div className="flex items-center justify-center gap-4">
        <button onClick={goToPrevDay} className="p-2 hover:bg-slate-100 rounded-lg">
          <ChevronLeft size={18} />
        </button>
        <div className="text-center">
          <p className="font-semibold text-slate-900">
            {format(parseISO(selectedDate), 'EEEE, MMMM d, yyyy')}
          </p>
          {isToday && <p className="text-xs text-primary-500">Today</p>}
        </div>
        <button
          onClick={goToNextDay}
          className={cn('p-2 rounded-lg', selectedDate < today ? 'hover:bg-slate-100' : 'opacity-30 cursor-not-allowed')}
          disabled={selectedDate >= today}
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Journal Editor */}
      <div className="card p-5 space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <BookOpen size={16} className="text-slate-500" />
            <label className="label !mb-0">How was your day?</label>
          </div>
          <textarea
            value={content}
            onChange={e => { setContent(e.target.value); setSaved(false) }}
            className="input min-h-[200px] resize-y"
            placeholder="Write about your day, thoughts, reflections..."
          />
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={16} className="text-amber-500" />
            <label className="label !mb-0">Gratitude</label>
          </div>
          <textarea
            value={gratitude}
            onChange={e => { setGratitude(e.target.value); setSaved(false) }}
            className="input min-h-[80px] resize-y"
            placeholder="What are you grateful for today?"
          />
        </div>

        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-400">
            {content.length} characters
          </p>
          <button
            onClick={saveEntry}
            disabled={saving || (!content.trim() && !gratitude.trim())}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors',
              saved ? 'bg-emerald-100 text-emerald-700' : 'btn-primary'
            )}
          >
            <Save size={16} />
            {saving ? 'Saving...' : saved ? 'Saved ✓' : 'Save'}
          </button>
        </div>
      </div>

      {/* Recent Entries */}
      <div>
        <h2 className="font-semibold text-slate-900 mb-3">Recent Entries</h2>
        {entries.length === 0 ? (
          <div className="card p-6 text-center">
            <p className="text-sm text-slate-400">No journal entries this month.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {entries.slice(0, 10).map(entry => (
              <button
                key={entry.id}
                onClick={() => setSelectedDate(entry.date)}
                className={cn(
                  'card w-full text-left p-4 transition-all hover:shadow-md',
                  selectedDate === entry.date && 'ring-2 ring-primary-400'
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-slate-900">
                    {format(parseISO(entry.date), 'EEEE, MMM d')}
                  </span>
                  {entry.date === today && (
                    <span className="badge bg-primary-100 text-primary-700">Today</span>
                  )}
                </div>
                <p className="text-sm text-slate-500 line-clamp-2">{entry.content}</p>
                {entry.gratitude && (
                  <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                    <Sparkles size={12} /> {entry.gratitude.substring(0, 80)}...
                  </p>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
