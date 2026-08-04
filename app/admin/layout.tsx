'use client'

import { useEffect, type ReactNode } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { ArrowLeft, Loader2, Radio, Video, LayoutDashboard } from 'lucide-react'

import { useAuth } from '@/lib/hooks/useAuth'
import { cn } from '@/lib/utils'
import { Logo } from '@/components/logo'

const adminNavItems = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/live-classes', label: 'Live Classes', icon: Radio },
  { href: '/admin/recorded-videos', label: 'Recorded Videos', icon: Video },
]

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, userProfile, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (loading) return
    if (!user) {
      router.replace('/login')
      return
    }
    if (userProfile && userProfile.role !== 'admin') {
      router.replace('/dashboard')
    }
  }, [loading, user, userProfile, router])

  if (loading || !user || !userProfile || userProfile.role !== 'admin') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-sidebar-border bg-sidebar lg:block">
        <div className="flex h-full flex-col gap-2 p-4">
          <div className="px-2 py-3">
            <Logo />
            <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-primary">
              Admin Panel
            </p>
          </div>

          <nav className="flex flex-1 flex-col gap-1">
            {adminNavItems.map((item) => {
              const active = pathname === item.href
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    active
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground',
                  )}
                >
                  <Icon className="size-[18px] shrink-0" aria-hidden="true" />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          <Link
            href="/dashboard"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent/50 hover:text-foreground"
          >
            <ArrowLeft className="size-[18px] shrink-0" aria-hidden="true" />
            Back to Student View
          </Link>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col lg:pl-64">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur lg:hidden">
          <Logo />
          <span className="text-xs font-semibold uppercase tracking-wide text-primary">Admin</span>
        </header>
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  )
}
