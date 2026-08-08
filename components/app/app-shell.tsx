'use client'

import {
  memo,
  useCallback,
  useDeferredValue,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

import {
  Bell,
  BookOpen,
  LayoutDashboard,
  LogOut,
  Menu,
  Radio,
  Search,
  Shield,
  Video,
  X,
  BarChart3,
  Download,
  XCircle,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { Logo } from '@/components/logo'
import { Button } from '@/components/ui/button'

import { useAuth } from '@/lib/hooks/useAuth'
import { useFirebaseData } from '@/lib/hooks/useFirebaseData'
import { signOut } from '@/lib/firebase-auth-operations'

import { ProfileDropdown } from '../ui/ProfileDropdown'

/* =========================================================
   Types
========================================================= */

interface AllCourseItem {
  title?: string
  Description?: string
  description?: string
  Link?: string
  link?: string
  Note?: string
  note?: string
}

interface CourseRecord {
  id: string
  title?: string
  description?: string
  Description?: string
  instructor?: string
  thumbnail?: string
  youtubeUrl?: string
  allCourse?: AllCourseItem[]
}

type SearchResult = {
  type: 'course' | 'video'
  courseId: string
  courseTitle: string
  title: string
  description: string
  link?: string
}

interface NavItem {
  href: string
  label: string
  icon: typeof LayoutDashboard
}

/* =========================================================
   Constants
   (module-level so the array isn't re-created every render)
========================================================= */

const NAV_ITEMS: readonly NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/courses', label: 'My Courses', icon: BookOpen },
  { href: '/live-classes', label: 'Live Classes', icon: Radio },
  { href: '/recorded-videos', label: 'Recorded Videos', icon: Video },
  { href: '/materials', label: 'Materials', icon: Download },
  { href: '/progress', label: 'Progress', icon: BarChart3 },
] as const

const MAX_SEARCH_RESULTS = 10

/* =========================================================
   Helpers
========================================================= */

/**
 * Builds initials from a display name, falling back to email.
 * Pure function — safe to keep outside the component so it
 * isn't re-created on every render.
 */
function getInitials(
  name?: string | null,
  email?: string | null,
): string {
  if (name && name.trim()) {
    const parts = name.trim().split(/\s+/)

    return parts.length > 1
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
      : parts[0].slice(0, 2).toUpperCase()
  }

  if (email) {
    return email.slice(0, 2).toUpperCase()
  }

  return 'U'
}

/**
 * Searches a list of courses (and their nested videos) for a
 * given query. Extracted as a standalone, pure function so it
 * can be unit tested independently of React and memoized
 * predictably via useMemo's dependency array.
 */
function searchCourses(
  courses: CourseRecord[] | undefined,
  rawQuery: string,
): SearchResult[] {
  const query = rawQuery.trim().toLowerCase()

  if (!query || !courses || courses.length === 0) {
    return []
  }

  const results: SearchResult[] = []

  for (const course of courses) {
    const courseTitle = course.title?.trim() || ''
    const courseDescription =
      course.description?.trim() || course.Description?.trim() || ''

    const courseMatches =
      courseTitle.toLowerCase().includes(query) ||
      courseDescription.toLowerCase().includes(query)

    if (courseMatches) {
      results.push({
        type: 'course',
        courseId: course.id,
        courseTitle,
        title: courseTitle || 'Untitled Course',
        description:
          courseDescription || 'No course description available.',
        link: undefined,
      })
    }

    if (Array.isArray(course.allCourse) && course.allCourse.length > 0) {
      for (const video of course.allCourse) {
        // Firebase data may use either `description` or `Description`.
        const videoTitle = video.title?.trim() || ''
        const videoDescription =
          video.description?.trim() || video.Description?.trim() || ''

        const videoMatches =
          videoTitle.toLowerCase().includes(query) ||
          videoDescription.toLowerCase().includes(query)

        if (videoMatches) {
          results.push({
            type: 'video',
            courseId: course.id,
            courseTitle: course.title || 'Untitled Course',
            title: videoTitle || 'Untitled Video',
            description:
              videoDescription || 'No video description available.',
            link: video.Link || video.link || undefined,
          })
        }
      }
    }

    // Stop early once we have more than enough results — avoids
    // scanning the entire dataset when the list is large.
    if (results.length >= MAX_SEARCH_RESULTS) {
      break
    }
  }

  return results.slice(0, MAX_SEARCH_RESULTS)
}

/* =========================================================
   Sidebar
========================================================= */

interface SidebarContentProps {
  onNavigate?: () => void
}

const SidebarContent = memo(function SidebarContent({
  onNavigate,
}: SidebarContentProps) {
  const pathname = usePathname()
  const router = useRouter()

  const { userProfile } = useAuth()

  const isAdmin = userProfile?.role === 'admin'

  const handleLogout = useCallback(async () => {
    onNavigate?.()

    try {
      await signOut()
    } finally {
      router.push('/login')
    }
  }, [onNavigate, router])

  return (
    <div className="flex h-full flex-col px-4 py-5">
      {/* Logo */}
      <div className="mb-8 px-2">
        <Logo />
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col gap-1" aria-label="Primary">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
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

        {/* Admin */}
        {isAdmin && (
          <Link
            href="/admin"
            onClick={onNavigate}
            aria-current={pathname.startsWith('/admin') ? 'page' : undefined}
            className={cn(
              'mt-2 flex items-center gap-3 rounded-lg border border-dashed border-primary/40 px-3 py-2.5 text-sm font-medium transition-colors',
              pathname.startsWith('/admin')
                ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                : 'text-primary hover:bg-sidebar-accent/50',
            )}
          >
            <Shield className="size-[18px] shrink-0" aria-hidden="true" />
            Admin Panel
          </Link>
        )}
      </nav>

      <button
        type="button"
        onClick={handleLogout}
        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent/50 hover:text-foreground"
      >
        <LogOut className="size-[18px] shrink-0" aria-hidden="true" />
        Log out
      </button>
    </div>
  )
})

/* =========================================================
   Search Result Row
   (memoized so typing doesn't re-render every row unnecessarily)
========================================================= */

interface SearchResultRowProps {
  result: SearchResult
  onSelect: () => void
}

const SearchResultRow = memo(function SearchResultRow({
  result,
  onSelect,
}: SearchResultRowProps) {
  const isVideo = result.type === 'video'

  // Course result -> /courses/courseId
  // Video result -> YouTube link from Firebase, falling back to the
  // parent course page when no direct link exists.
  const href = isVideo
    ? result.link || `/courses/${result.courseId}`
    : `/courses/${result.courseId}`

  const isExternalVideo = isVideo && Boolean(result.link)

  return (
    <li role="none">
      <Link
        role="option"
        aria-selected={false}
        href={href}
        target={isExternalVideo ? '_blank' : undefined}
        rel={isExternalVideo ? 'noopener noreferrer' : undefined}
        onClick={onSelect}
        className="group flex gap-3 px-4 py-3 transition-colors hover:bg-muted"
      >
        {/* Icon */}
        <div
          className={cn(
            'flex size-10 shrink-0 items-center justify-center rounded-lg',
            isVideo
              ? 'bg-primary/10 text-primary'
              : 'bg-accent text-accent-foreground',
          )}
          aria-hidden="true"
        >
          {isVideo ? (
            <Video className="size-4" />
          ) : (
            <BookOpen className="size-4" />
          )}
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          {/* Title + Type */}
          <div className="flex items-center gap-2">
            <p className="min-w-0 flex-1 truncate text-sm font-medium text-foreground group-hover:text-primary">
              {result.title}
            </p>

            <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
              {isVideo ? 'Video' : 'Course'}
            </span>
          </div>

          {/* Description */}
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
            {result.description}
          </p>

          {/* Parent Course */}
          {isVideo && (
            <div className="mt-1.5 flex items-center gap-1">
              <BookOpen
                className="size-3 text-muted-foreground"
                aria-hidden="true"
              />
              <p className="truncate text-[11px] text-muted-foreground">
                {result.courseTitle}
              </p>
            </div>
          )}
        </div>
      </Link>
    </li>
  )
})

/* =========================================================
   Search Dropdown
   (isolated so header input changes don't re-render the whole
   shell/main content tree)
========================================================= */

interface SearchDropdownProps {
  loading: boolean
  results: SearchResult[]
  onSelect: () => void
}

const SearchDropdown = memo(function SearchDropdown({
  loading,
  results,
  onSelect,
}: SearchDropdownProps) {
  return (
    <div
      className="absolute left-0 right-0 top-12 z-50 overflow-hidden rounded-xl border border-border bg-background shadow-xl"
      role="listbox"
      aria-label="Search results"
    >
      {loading ? (
        <div
          className="flex items-center gap-3 px-4 py-5"
          role="status"
          aria-live="polite"
        >
          <div
            className="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent"
            aria-hidden="true"
          />
          <p className="text-sm text-muted-foreground">
            Searching courses and videos...
          </p>
        </div>
      ) : results.length === 0 ? (
        <div className="px-4 py-7 text-center" role="status">
          <div
            className="mx-auto mb-3 flex size-10 items-center justify-center rounded-full bg-muted"
            aria-hidden="true"
          >
            <Search className="size-5 text-muted-foreground" />
          </div>

          <p className="text-sm font-semibold text-foreground">
            No results found
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            Try searching for another course, video, or topic.
          </p>
        </div>
      ) : (
        <div className="max-h-[450px] overflow-y-auto py-2">
          <div className="px-4 py-2">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Search Results
            </p>
          </div>

          <ul role="presentation">
            {results.map((result, index) => (
              <SearchResultRow
                key={`${result.type}-${result.courseId}-${result.title}-${index}`}
                result={result}
                onSelect={onSelect}
              />
            ))}
          </ul>

          {results.length >= MAX_SEARCH_RESULTS && (
            <div className="border-t border-border px-4 py-2.5 text-center">
              <p className="text-[11px] text-muted-foreground">
                Showing the first {MAX_SEARCH_RESULTS} results
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
})

/* =========================================================
   App Shell
========================================================= */

export function AppShell({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const { user, userProfile } = useAuth()

  /* =======================================================
     Firebase Courses
     useFirebaseData is expected to cache/subscribe internally;
     we only consume its result here.
  ======================================================= */

  const { data: courses, loading: coursesLoading } =
    useFirebaseData<CourseRecord>('courses')

  /* =======================================================
     User Information
     Memoized so identical renders (e.g. caused by search
     input keystrokes) don't recompute these on every render.
  ======================================================= */

  const displayName = useMemo(
    () =>
      userProfile?.displayName || user?.displayName || user?.email || 'Learner',
    [userProfile?.displayName, user?.displayName, user?.email],
  )

  const role = useMemo(
    () =>
      userProfile?.role
        ? userProfile.role.charAt(0).toUpperCase() + userProfile.role.slice(1)
        : 'Student',
    [userProfile?.role],
  )

  const initials = useMemo(
    () => getInitials(userProfile?.displayName || user?.displayName, user?.email),
    [userProfile?.displayName, user?.displayName, user?.email],
  )

  /* =======================================================
     Search Courses + Videos

     useDeferredValue keeps the input responsive by letting
     React defer the (potentially expensive) filtering pass on
     large course lists behind the more urgent keystroke update.
  ======================================================= */

  const deferredSearchQuery = useDeferredValue(searchQuery)

  const searchResults = useMemo<SearchResult[]>(
    () => searchCourses(courses, deferredSearchQuery),
    [courses, deferredSearchQuery],
  )

  const isSearchStale = searchQuery !== deferredSearchQuery

  /* =======================================================
     Handlers
  ======================================================= */

  const clearSearch = useCallback(() => {
    setSearchQuery('')
  }, [])

  const handleSearchChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(event.target.value)
    },
    [],
  )

  const openMobileSidebar = useCallback(() => setMobileOpen(true), [])
  const closeMobileSidebar = useCallback(() => setMobileOpen(false), [])

  const hasQuery = searchQuery.trim().length > 0

  /* =======================================================
     Render
  ======================================================= */

  return (
    <div className="min-h-screen bg-background">
      {/* ===================================================
          Desktop Sidebar
      =================================================== */}

      <aside
        className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-sidebar-border bg-sidebar lg:block"
        aria-label="Sidebar navigation"
      >
        <SidebarContent />
      </aside>

      {/* ===================================================
          Mobile Sidebar
      =================================================== */}

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
            onClick={closeMobileSidebar}
            aria-hidden="true"
          />

          {/* Sidebar */}
          <aside
            className="absolute inset-y-0 left-0 w-72 max-w-[80%] border-r border-sidebar-border bg-sidebar shadow-xl"
            aria-label="Sidebar navigation"
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={closeMobileSidebar}
              className="absolute right-3 top-4 z-10 flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted"
              aria-label="Close menu"
            >
              <X className="size-5" aria-hidden="true" />
            </button>

            <SidebarContent onNavigate={closeMobileSidebar} />
          </aside>
        </div>
      )}

      {/* ===================================================
          Main Area
      =================================================== */}

      <div className="flex min-w-0 flex-1 flex-col lg:pl-64">
        {/* =================================================
            Header
        ================================================= */}

        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur sm:px-6">
          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={openMobileSidebar}
            className="flex size-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="size-5" aria-hidden="true" />
          </button>

          {/* Search */}
          <div
            className="relative hidden max-w-md flex-1 sm:block"
            role="search"
          >
            <Search
              className="pointer-events-none absolute left-3 top-1/2 z-10 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />

            <label htmlFor="app-shell-search" className="sr-only">
              Search courses and videos
            </label>

            <input
              id="app-shell-search"
              type="search"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search courses, videos..."
              autoComplete="off"
              role="combobox"
              aria-expanded={hasQuery}
              aria-controls="app-shell-search-results"
              aria-autocomplete="list"
              className="h-10 w-full rounded-lg border border-input bg-card pl-9 pr-10 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/25"
            />

            {searchQuery && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-2 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label="Clear search"
              >
                <XCircle className="size-4" aria-hidden="true" />
              </button>
            )}

            {hasQuery && (
              <div id="app-shell-search-results">
                <SearchDropdown
                  loading={coursesLoading || isSearchStale}
                  results={searchResults}
                  onSelect={clearSearch}
                />
              </div>
            )}
          </div>

          {/* Right Header Area */}
          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            {/* Notifications */}
            <button
              type="button"
              className="relative flex size-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted"
              aria-label="Notifications"
            >
              <Bell className="size-5" aria-hidden="true" />
              <span
                className="absolute right-2 top-2 size-2 rounded-full bg-destructive ring-2 ring-background"
                aria-hidden="true"
              />
            </button>

            <ProfileDropdown />
          </div>
        </header>

        {/* =================================================
            Page Content
        ================================================= */}

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  )
}