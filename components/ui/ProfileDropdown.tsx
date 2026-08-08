'use client'

import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Bell,
  BookOpen,
  GraduationCap,
  Heart,
  LogOut,
  Mail,
  ShoppingCart,
  User,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/hooks/useAuth'
import { signOut } from '@/lib/firebase-auth-operations'

function getInitials(name?: string | null, email?: string | null) {
  if (name && name.trim()) {
    const parts = name.trim().split(/\s+/)
    return parts.length > 1
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
      : parts[0].slice(0, 2).toUpperCase()
  }
  if (email) return email.slice(0, 2).toUpperCase()
  return 'U'
}

interface MenuLink {
  href: string
  label: string
  icon: typeof BookOpen
}

const menuLinks: MenuLink[] = [
  { href: '/courses', label: 'My Courses', icon: BookOpen },
  { href: '/profile', label: 'My Profile', icon: User },
  { href: '/cart', label: 'My Cart', icon: ShoppingCart },
  { href: '/wishlist', label: 'Wishlist', icon: Heart },
  { href: '/teach', label: 'Teach on Platform', icon: GraduationCap },
  { href: '/messages', label: 'Messages', icon: Mail },
]

interface AvatarProps {
  photoURL?: string | null
  initials: string
  size: 'sm' | 'md'
}

function Avatar({ photoURL, initials, size }: AvatarProps) {
  if (photoURL) {
    return (
      // next/image requires the remote host to be allow-listed in next.config;
      // since photoURL is a dynamic, arbitrary user-supplied URL (Firebase/Google
      // avatars, etc.), a plain <img> avoids breaking on unconfigured domains.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={photoURL}
        alt=""
        width={size === 'sm' ? 36 : 44}
        height={size === 'sm' ? 36 : 44}
        loading="lazy"
        decoding="async"
        className={cn(
          'shrink-0 rounded-full object-cover',
          size === 'sm' ? 'size-9 ring-2 ring-transparent' : 'size-11',
        )}
      />
    )
  }

  return (
    <span
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground',
        size === 'sm' ? 'size-9 text-sm' : 'size-11 text-base',
      )}
      aria-hidden="true"
    >
      {initials}
    </span>
  )
}

function ProfileDropdownComponent() {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const { user, userProfile } = useAuth()

  const displayName = userProfile?.displayName || user?.displayName || user?.email || 'Learner'
  const email = user?.email || ''
  const initials = useMemo(
    () => getInitials(userProfile?.displayName || user?.displayName, user?.email),
    [userProfile?.displayName, user?.displayName, user?.email],
  )
  const photoURL = user?.photoURL
  const roleLabel = userProfile?.role
    ? userProfile.role.charAt(0).toUpperCase() + userProfile.role.slice(1)
    : 'Student'

  const toggleOpen = useCallback(() => setOpen((v) => !v), [])
  const closeMenu = useCallback(() => setOpen(false), [])

  // Close on outside click
  useEffect(() => {
    if (!open) return

    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  // Close on Escape
  useEffect(() => {
    if (!open) return

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open])

  const handleLogout = useCallback(async () => {
    setOpen(false)
    try {
      await signOut()
    } finally {
      router.push('/login')
    }
  }, [router])

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={toggleOpen}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`${displayName} account menu`}
        className="flex items-center gap-2.5 rounded-lg p-1 pr-1 transition-colors hover:bg-muted sm:pr-2"
      >
        <Avatar photoURL={photoURL} initials={initials} size="sm" />
        <div className="hidden text-left leading-tight sm:block">
          <p className="text-sm font-medium text-foreground">{displayName}</p>
          <p className="text-xs text-muted-foreground">{roleLabel}</p>
        </div>
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Account menu"
          className={cn(
            'absolute right-0 z-40 mt-2 w-72 origin-top-right overflow-hidden rounded-xl border border-border bg-card shadow-lg',
            'animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-150',
          )}
        >
          {/* Header: avatar, name, email */}
          <div className="flex items-center gap-3 border-b border-border px-4 py-4">
            <Avatar photoURL={photoURL} initials={initials} size="md" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">{displayName}</p>
              {email && <p className="truncate text-xs text-muted-foreground">{email}</p>}
            </div>
          </div>

          {/* Links */}
          <nav className="flex flex-col py-1.5" aria-label="Profile links">
            {menuLinks.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMenu}
                  role="menuitem"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                >
                  <Icon className="size-[18px] shrink-0 text-muted-foreground" aria-hidden="true" />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* Logout */}
          <div className="border-t border-border py-1.5">
            <button
              type="button"
              onClick={handleLogout}
              role="menuitem"
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <LogOut className="size-[18px] shrink-0" aria-hidden="true" />
              Log out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

ProfileDropdownComponent.displayName = 'ProfileDropdown'

export const ProfileDropdown = memo(ProfileDropdownComponent)