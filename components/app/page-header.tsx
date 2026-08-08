import { memo } from 'react'
import type { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  description?: string
  action?: ReactNode
}

function PageHeaderComponent({ title, description, action }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-balance font-heading text-2xl font-bold tracking-tight text-foreground sm:text-[1.75rem]">
          {title}
        </h1>
        {description && (
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{description}</p>
        )}
      </div>
      {action && (
        <div className="flex shrink-0 items-center gap-2" role="group" aria-label="Page actions">
          {action}
        </div>
      )}
    </div>
  )
}

PageHeaderComponent.displayName = 'PageHeader'

// No 'use client' needed — this component has no hooks/state/browser APIs, so it
// renders as a Server Component by default, shipping zero JS for it to the client.
export const PageHeader = memo(PageHeaderComponent)