'use client'

import { usePathname } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { cn } from '@/lib/utils'

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isLoginPage = pathname === '/login'

  return (
    <>
      {!isLoginPage && <Sidebar />}
      <main className={cn(!isLoginPage && 'lg:ml-64 min-h-screen pt-14 lg:pt-0')}>
        <div className={cn(!isLoginPage ? 'max-w-6xl mx-auto px-4 sm:px-6 py-6 lg:py-8' : 'min-h-screen')}>
          {children}
        </div>
      </main>
    </>
  )
}
