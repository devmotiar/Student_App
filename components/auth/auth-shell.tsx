import type { ReactNode } from 'react'
import { CheckCircle2 } from 'lucide-react'

import { Logo } from '@/components/logo'

const highlights = [
  'Learn from expert-led live classes',
  'Watch recorded lessons anytime',
  'Track progress with a personal dashboard',
]

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: ReactNode
}) {
  return (
    <main className="flex min-h-screen w-full flex-col lg:flex-row">
      {/* Brand panel */}
      <section className="relative hidden overflow-hidden bg-primary lg:flex lg:w-1/2 lg:flex-col lg:justify-between lg:p-12 xl:p-16">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-24 size-96 rounded-full bg-primary-foreground/10 blur-2xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-32 -left-16 size-96 rounded-full bg-primary-foreground/10 blur-2xl"
        />

        <div className="relative">
          <Logo className="[&_span:last-child]:text-primary-foreground [&>span:first-child]:bg-primary-foreground [&>span:first-child]:text-primary" />
        </div>

        <div className="relative max-w-md">
          <h2 className="font-heading text-3xl font-bold leading-tight text-primary-foreground text-balance xl:text-4xl">
            Unlock your potential with world-class courses.
          </h2>
          <p className="mt-4 text-primary-foreground/80 leading-relaxed">
            Join over 200,000 learners building in-demand skills through live
            classes and on-demand video lessons.
          </p>
          <ul className="mt-8 flex flex-col gap-3">
            {highlights.map((item) => (
              <li key={item} className="flex items-center gap-3 text-primary-foreground/90">
                <CheckCircle2 className="size-5 shrink-0" aria-hidden="true" />
                <span className="text-sm">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-sm text-primary-foreground/70">
          &copy; {new Date().getFullYear()} SITM Learning. All rights reserved.
        </p>
      </section>

      {/* Form panel */}
      <section className="flex flex-1 items-center justify-center px-5 py-10 sm:px-8">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>
          <div className="mb-8">
            <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground text-balance">
              {title}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{subtitle}</p>
          </div>
          {children}
        </div>
      </section>
    </main>
  )
}
