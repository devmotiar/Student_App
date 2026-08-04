// import { cn } from '@/lib/utils'

// export function ProgressBar({
//   value,
//   className,
// }: {
//   value: number
//   className?: string
// }) {
//   return (
//     <div
//       className={cn('h-2 w-full overflow-hidden rounded-full bg-muted', className)}
//       role="progressbar"
//       aria-valuenow={value}
//       aria-valuemin={0}
//       aria-valuemax={100}
//     >
//       <div
//         className="h-full rounded-full bg-primary transition-all"
//         style={{ width: `${value}%` }}
//       />
//     </div>
//   )
// }




import { cn } from '@/lib/utils'

export function ProgressBar({
  value,
  className,
}: {
  value: number
  className?: string
}) {
  return (
    <div
      className={cn('h-2 w-full overflow-hidden rounded-full bg-muted', className)}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full rounded-full bg-gradient-to-r from-primary/80 to-primary transition-all duration-500 ease-out"
        style={{ width: `${value}%` }}
      />
    </div>
  )
}