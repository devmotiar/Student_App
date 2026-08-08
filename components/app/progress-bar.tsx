import { memo } from 'react'

import { cn } from '@/lib/utils'

interface ProgressBarProps {
  value: number
  className?: string
}

function ProgressBarComponent({ value, className }: ProgressBarProps) {
  // Clamp defensively so out-of-range values can't produce an invalid
  // aria-valuenow or a visually broken (>100%/negative) bar width.
  const clampedValue = Math.min(100, Math.max(0, value))

  return (
    <div
      className={cn('h-2 w-full overflow-hidden rounded-full bg-muted', className)}
      role="progressbar"
      aria-valuenow={clampedValue}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Progress"
    >
      <div
        className="h-full rounded-full bg-gradient-to-r from-primary/80 to-primary transition-all duration-500 ease-out"
        style={{ width: `${clampedValue}%` }}
      />
    </div>
  )
}

ProgressBarComponent.displayName = 'ProgressBar'

// No 'use client' needed — no hooks/state/handlers, so this renders as a
// Server Component by default, shipping zero JS to the client.
export const ProgressBar = memo(ProgressBarComponent)