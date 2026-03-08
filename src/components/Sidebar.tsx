'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, CheckSquare, Target, CalendarDays,
  StickyNote, Heart, Droplets, BookOpen, Activity,
  Menu, X, Zap, LogOut
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/habits', label: 'Habits', icon: CheckSquare },
  { href: '/tracker', label: 'Tracker', icon: CalendarDays },
  { href: '/goals', label: 'Goals', icon: Target },
  { href: '/notes', label: 'Notes', icon: StickyNote },
  { href: '/mood', label: 'Mood', icon: Heart },
  { href: '/water', label: 'Water', icon: Droplets },
  { href: '/journal', label: 'Journal', icon: BookOpen },
  { href: '/fitness', label: 'Fitness', icon: Activity },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setMobileOpen(false)
    router.push('/login')
    router.refresh()
  }

  return (
    <>
      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b border-slate-200 z-40 flex items-center px-4">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 hover:bg-slate-100 rounded-xl"
        >
          <Menu size={20} />
        </button>
        <div className="flex items-center gap-2 ml-3">
          <Zap size={20} className="text-primary-500" />
          <span className="font-bold text-lg">HabitFlow</span>
        </div>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 z-50"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 h-full w-64 bg-white border-r border-slate-200 z-50 flex flex-col transition-transform duration-300',
          'lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between px-5 h-16 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
              <Zap size={18} className="text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">HabitFlow</span>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1.5 hover:bg-slate-100 rounded-lg"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={isActive ? 'sidebar-link-active' : 'sidebar-link'}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="px-4 py-4 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl px-3 py-2.5 transition-colors duration-200"
          >
            <LogOut size={16} />
            Lock App
          </button>
          <p className="text-xs text-slate-400 text-center">
            HabitFlow v1.0 — Personal Use
          </p>
        </div>
      </aside>
    </>
  )
}
