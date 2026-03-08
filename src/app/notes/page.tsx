'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Pin, PinOff, Trash2, Edit2, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

interface Note {
  id: string
  title: string
  content: string
  pinned: boolean
  color: string
  createdAt: string
  updatedAt: string
}

const NOTE_COLORS = [
  '#ffffff', '#fef3c7', '#dbeafe', '#dcfce7',
  '#fce7f3', '#ede9fe', '#ffedd5', '#f0fdf4',
]

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)

  const fetchNotes = useCallback(async () => {
    const res = await fetch('/api/notes')
    const data = await res.json()
    setNotes(data)
    setLoading(false)
  }, [])

  useEffect(() => { fetchNotes() }, [fetchNotes])

  const togglePin = async (note: Note) => {
    await fetch(`/api/notes/${note.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pinned: !note.pinned }),
    })
    fetchNotes()
  }

  const deleteNote = async (id: string) => {
    if (!confirm('Delete this note?')) return
    await fetch(`/api/notes/${id}`, { method: 'DELETE' })
    fetchNotes()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-slate-400">Loading notes...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Notes</h1>
          <p className="text-slate-500 mt-1">Quick notes & reminders</p>
        </div>
        <button
          onClick={() => { setEditingNote(null); setShowForm(true) }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={18} />
          <span className="hidden sm:inline">New Note</span>
        </button>
      </div>

      {notes.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-slate-500 text-sm">No notes yet. Create your first one!</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map(note => (
            <div
              key={note.id}
              className="card-hover p-4 flex flex-col"
              style={{ backgroundColor: note.color === '#ffffff' ? undefined : note.color }}
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium text-slate-900 truncate flex-1">{note.title}</h3>
                <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                  <button
                    onClick={() => togglePin(note)}
                    className="p-1 hover:bg-black/5 rounded-lg"
                    title={note.pinned ? 'Unpin' : 'Pin'}
                  >
                    {note.pinned ? <PinOff size={14} className="text-amber-500" /> : <Pin size={14} className="text-slate-400" />}
                  </button>
                  <button
                    onClick={() => { setEditingNote(note); setShowForm(true) }}
                    className="p-1 hover:bg-black/5 rounded-lg"
                  >
                    <Edit2 size={14} className="text-slate-400" />
                  </button>
                  <button
                    onClick={() => deleteNote(note.id)}
                    className="p-1 hover:bg-black/5 rounded-lg"
                  >
                    <Trash2 size={14} className="text-slate-400" />
                  </button>
                </div>
              </div>
              <p className="text-sm text-slate-600 flex-1 whitespace-pre-wrap line-clamp-6">
                {note.content}
              </p>
              <p className="text-xs text-slate-400 mt-3">
                {format(new Date(note.updatedAt), 'MMM d, yyyy h:mm a')}
              </p>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <NoteForm
          note={editingNote}
          onClose={() => { setShowForm(false); setEditingNote(null) }}
          onSave={() => { setShowForm(false); setEditingNote(null); fetchNotes() }}
        />
      )}
    </div>
  )
}

function NoteForm({ note, onClose, onSave }: {
  note: Note | null; onClose: () => void; onSave: () => void
}) {
  const [title, setTitle] = useState(note?.title || '')
  const [content, setContent] = useState(note?.content || '')
  const [color, setColor] = useState(note?.color || '#ffffff')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    setSaving(true)

    const data = { title: title.trim(), content, color }

    if (note) {
      await fetch(`/api/notes/${note.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
    } else {
      await fetch('/api/notes', {
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
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{note ? 'Edit Note' : 'New Note'}</h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="label">Title *</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="input"
              placeholder="Note title..."
              autoFocus
            />
          </div>
          <div>
            <label className="label">Content</label>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              className="input min-h-[150px] resize-y"
              placeholder="Write your note..."
            />
          </div>
          <div>
            <label className="label">Color</label>
            <div className="flex gap-2">
              {NOTE_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={cn(
                    'w-8 h-8 rounded-full border-2 transition-all',
                    color === c ? 'border-slate-400 scale-110' : 'border-slate-200 hover:scale-105'
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={saving || !title.trim()} className="btn-primary flex-1">
              {saving ? 'Saving...' : note ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
