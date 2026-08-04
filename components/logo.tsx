import { GraduationCap } from 'lucide-react'

import { cn } from '@/lib/utils'

export function Logo({
  className,
  showText = true,
}: {
  className?: string
  showText?: boolean
}) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
        <GraduationCap className="size-5" aria-hidden="true" />
      </span>
      {showText && (
        <span className="font-heading text-lg font-bold tracking-tight text-foreground">
          Lumina
        </span>
      )}
    </span>
  )
}
