'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Plus, CheckCircle2, Circle, Trash2, ChevronDown,
  ChevronUp, Target, Calendar, Flag
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns'

interface GoalTask {
  id: string
  goalId: string
  title: string
  completed: boolean
  sortOrder: number
}

interface Goal {
  id: string
  title: string
  description: string | null
  type: string
  startDate: string
  endDate: string
  status: string
  priority: string
  progress: number
  tasks: GoalTask[]
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('active')
  const [expandedGoal, setExpandedGoal] = useState<string | null>(null)

  const fetchGoals = useCallback(async () => {
    const params = filter !== 'all' ? `?status=${filter}` : ''
    const res = await fetch(`/api/goals${params}`)
    const data = await res.json()
    setGoals(data)
    setLoading(false)
  }, [filter])

  useEffect(() => { fetchGoals() }, [fetchGoals])

  const toggleTask = async (task: GoalTask) => {
    await fetch('/api/goals/tasks', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: task.id, completed: !task.completed }),
    })
    fetchGoals()
  }

  const addTask = async (goalId: string, title: string) => {
    if (!title.trim()) return
    await fetch('/api/goals/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ goalId, title }),
    })
    fetchGoals()
  }

  const deleteGoal = async (id: string) => {
    if (!confirm('Delete this goal and all its tasks?')) return
    await fetch(`/api/goals/${id}`, { method: 'DELETE' })
    fetchGoals()
  }

  const updateGoalStatus = async (id: string, status: string) => {
    await fetch(`/api/goals/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    fetchGoals()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-slate-400">Loading goals...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Goals</h1>
          <p className="text-slate-500 mt-1">Weekly & monthly targets</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={18} />
          <span className="hidden sm:inline">New Goal</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {(['active', 'completed', 'all'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors',
              filter === f ? 'bg-primary-100 text-primary-700' : 'text-slate-500 hover:bg-slate-100'
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Goals List */}
      {goals.length === 0 ? (
        <div className="card p-8 text-center">
          <Target size={40} className="text-slate-200 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">
            {filter === 'active' ? 'No active goals. Set one now!' : 'No goals found.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {goals.map(goal => (
            <GoalCard
              key={goal.id}
              goal={goal}
              expanded={expandedGoal === goal.id}
              onToggleExpand={() => setExpandedGoal(expandedGoal === goal.id ? null : goal.id)}
              onToggleTask={toggleTask}
              onAddTask={(title) => addTask(goal.id, title)}
              onDelete={() => deleteGoal(goal.id)}
              onStatusChange={(status) => updateGoalStatus(goal.id, status)}
            />
          ))}
        </div>
      )}

      {showForm && (
        <GoalForm
          onClose={() => setShowForm(false)}
          onSave={() => { setShowForm(false); fetchGoals() }}
        />
      )}
    </div>
  )
}

function GoalCard({
  goal, expanded, onToggleExpand, onToggleTask, onAddTask, onDelete, onStatusChange
}: {
  goal: Goal
  expanded: boolean
  onToggleExpand: () => void
  onToggleTask: (task: GoalTask) => void
  onAddTask: (title: string) => void
  onDelete: () => void
  onStatusChange: (status: string) => void
}) {
  const [newTask, setNewTask] = useState('')

  const completedTasks = goal.tasks.filter(t => t.completed).length
  const totalTasks = goal.tasks.length

  return (
    <div className="card overflow-hidden">
      <div
        className="p-4 cursor-pointer hover:bg-slate-50/50 transition-colors"
        onClick={onToggleExpand}
      >
        <div className="flex items-start gap-3">
          <div className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5',
            goal.status === 'completed' ? 'bg-emerald-100' :
            goal.priority === 'high' ? 'bg-red-50' :
            goal.priority === 'medium' ? 'bg-amber-50' : 'bg-blue-50'
          )}>
            {goal.status === 'completed' ? (
              <CheckCircle2 size={18} className="text-emerald-600" />
            ) : (
              <Target size={18} className={cn(
                goal.priority === 'high' ? 'text-red-500' :
                goal.priority === 'medium' ? 'text-amber-500' : 'text-blue-500'
              )} />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className={cn(
                'font-medium text-slate-900 truncate',
                goal.status === 'completed' && 'line-through text-slate-500'
              )}>
                {goal.title}
              </h3>
              <span className={cn(
                'badge flex-shrink-0',
                goal.type === 'weekly' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
              )}>
                {goal.type}
              </span>
              <span className={cn(
                'badge flex-shrink-0',
                goal.priority === 'high' ? 'bg-red-100 text-red-700' :
                goal.priority === 'medium' ? 'bg-amber-100 text-amber-700' :
                'bg-green-100 text-green-700'
              )}>
                {goal.priority}
              </span>
            </div>
            {goal.description && (
              <p className="text-sm text-slate-500 mt-1 truncate">{goal.description}</p>
            )}
            <div className="flex items-center gap-4 mt-2">
              <div className="flex-1">
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className={cn(
                      'h-2 rounded-full transition-all duration-500',
                      goal.status === 'completed' ? 'bg-emerald-500' : 'bg-primary-500'
                    )}
                    style={{ width: `${goal.progress}%` }}
                  />
                </div>
              </div>
              <span className="text-xs text-slate-500 flex-shrink-0">
                {completedTasks}/{totalTasks} tasks
              </span>
            </div>
            <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Calendar size={12} />
                {goal.startDate} → {goal.endDate}
              </span>
            </div>
          </div>
          <div className="flex-shrink-0">
            {expanded ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
          </div>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-slate-100 p-4 bg-slate-50/50 space-y-3">
          {/* Tasks */}
          {goal.tasks.map(task => (
            <div key={task.id} className="flex items-center gap-3">
              <button onClick={() => onToggleTask(task)} className="flex-shrink-0">
                {task.completed ? (
                  <CheckCircle2 size={18} className="text-emerald-500" />
                ) : (
                  <Circle size={18} className="text-slate-300 hover:text-slate-400" />
                )}
              </button>
              <span className={cn(
                'text-sm flex-1',
                task.completed ? 'text-slate-400 line-through' : 'text-slate-700'
              )}>
                {task.title}
              </span>
            </div>
          ))}

          {/* Add task */}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              onAddTask(newTask)
              setNewTask('')
            }}
            className="flex items-center gap-2"
          >
            <input
              value={newTask}
              onChange={e => setNewTask(e.target.value)}
              placeholder="Add a task..."
              className="input flex-1 !py-2 !text-sm"
            />
            <button type="submit" className="btn-secondary !py-2 !px-3 text-sm">
              Add
            </button>
          </form>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
            {goal.status === 'active' && (
              <button
                onClick={() => onStatusChange('completed')}
                className="text-xs text-emerald-600 hover:bg-emerald-50 px-2 py-1 rounded-lg"
              >
                Mark Complete
              </button>
            )}
            {goal.status === 'completed' && (
              <button
                onClick={() => onStatusChange('active')}
                className="text-xs text-primary-600 hover:bg-primary-50 px-2 py-1 rounded-lg"
              >
                Reopen
              </button>
            )}
            <button
              onClick={onDelete}
              className="text-xs text-red-500 hover:bg-red-50 px-2 py-1 rounded-lg ml-auto"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function GoalForm({ onClose, onSave }: { onClose: () => void; onSave: () => void }) {
  const now = new Date()
  const weekStart = format(startOfWeek(now, { weekStartsOn: 1 }), 'yyyy-MM-dd')
  const weekEnd = format(endOfWeek(now, { weekStartsOn: 1 }), 'yyyy-MM-dd')
  const monthStart = format(startOfMonth(now), 'yyyy-MM-dd')
  const monthEnd = format(endOfMonth(now), 'yyyy-MM-dd')

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState('weekly')
  const [priority, setPriority] = useState('medium')
  const [startDate, setStartDate] = useState(type === 'weekly' ? weekStart : monthStart)
  const [endDate, setEndDate] = useState(type === 'weekly' ? weekEnd : monthEnd)
  const [tasks, setTasks] = useState<string[]>([''])
  const [saving, setSaving] = useState(false)

  const handleTypeChange = (newType: string) => {
    setType(newType)
    if (newType === 'weekly') {
      setStartDate(weekStart)
      setEndDate(weekEnd)
    } else if (newType === 'monthly') {
      setStartDate(monthStart)
      setEndDate(monthEnd)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    setSaving(true)

    await fetch('/api/goals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: title.trim(),
        description: description.trim() || null,
        type,
        priority,
        startDate,
        endDate,
        tasks: tasks.filter(t => t.trim()).map(t => ({ title: t.trim() })),
      }),
    })
    setSaving(false)
    onSave()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="p-5 border-b border-slate-100">
          <h2 className="text-lg font-semibold">New Goal</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="label">Title *</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="input"
              placeholder="e.g., Complete project, Read 2 books..."
              autoFocus
            />
          </div>

          <div>
            <label className="label">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="input min-h-[80px] resize-y"
              placeholder="Optional details..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Type</label>
              <select value={type} onChange={e => handleTypeChange(e.target.value)} className="input">
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            <div>
              <label className="label">Priority</label>
              <select value={priority} onChange={e => setPriority(e.target.value)} className="input">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Start Date</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="input" />
            </div>
            <div>
              <label className="label">End Date</label>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="input" />
            </div>
          </div>

          <div>
            <label className="label">Tasks</label>
            <div className="space-y-2">
              {tasks.map((task, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    value={task}
                    onChange={e => {
                      const copy = [...tasks]
                      copy[i] = e.target.value
                      setTasks(copy)
                    }}
                    className="input flex-1"
                    placeholder={`Task ${i + 1}`}
                  />
                  {tasks.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setTasks(tasks.filter((_, j) => j !== i))}
                      className="btn-ghost !px-2 text-red-400"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => setTasks([...tasks, ''])}
                className="text-sm text-primary-500 hover:text-primary-600"
              >
                + Add another task
              </button>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={saving || !title.trim()} className="btn-primary flex-1">
              {saving ? 'Creating...' : 'Create Goal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
