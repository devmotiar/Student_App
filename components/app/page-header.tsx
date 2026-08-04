

import type { ReactNode } from 'react'

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-balance font-heading text-2xl font-bold tracking-tight text-foreground sm:text-[1.75rem]">
          {title}
        </h1>
        {description && (
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
    </div>
  )
}