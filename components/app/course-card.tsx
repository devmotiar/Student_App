// 'use client'

// import { useState, useCallback } from 'react'
// import Image from 'next/image'
// import Link from 'next/link'
// import { Clock, PlayCircle, Star } from 'lucide-react'

// import type { Course } from '@/lib/mock-data'
// import { Badge } from '@/components/ui/badge'
// import { Button } from '@/components/ui/button'
// import { ProgressBar } from '@/components/app/progress-bar'

// function getYoutubeId(url?: string | null): string {
//   if (!url) return ''
//   try {
//     const parsed = new URL(url)
//     const v = parsed.searchParams.get('v')
//     if (v) return v
//     if (parsed.hostname.includes('youtu.be')) return parsed.pathname.replace('/', '')
//     if (parsed.pathname.includes('/embed/')) return parsed.pathname.split('/embed/')[1]
//     return ''
//   } catch {
//     return ''
//   }
// }

// export function CourseCard({ course }: { course: Course }) {
//   const started = course.progress > 0
//   const [hovered, setHovered] = useState(false)
//   const videoId = getYoutubeId(course.youtubeUrl)

//   const startHref = `/courses/${course.id}?autoplay=1`

//   const onEnter = useCallback(() => setHovered(true), [])
//   const onLeave = useCallback(() => setHovered(false), [])

//   return (
//     <article
//       className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md"
//       onMouseEnter={onEnter}
//       onMouseLeave={onLeave}
//     >
//       <Link href={`/courses/${course.id}`} className="block">
//         <div className="relative aspect-video overflow-hidden bg-muted">
//           {hovered && videoId ? (
//             <iframe
//               className="absolute inset-0 h-full w-full"
//               src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${videoId}&playsinline=1&modestbranding=1&rel=0`}
//               title={course.title}
//               allow="autoplay; encrypted-media"
//               allowFullScreen
//               loading="lazy"
//             />
//           ) : (
//             <Image
//               src={course.thumbnail || '/placeholder.svg'}
//               alt={`${course.title} course thumbnail`}
//               fill
//               sizes="(max-width: 768px) 100vw, 33vw"
//               className="object-cover transition-transform duration-300 group-hover:scale-105"
//             />
//           )}
//           <Badge variant="secondary" className="absolute left-3 top-3 z-10 bg-card/90 backdrop-blur">
//             {course.category}
//           </Badge>
//         </div>

//         <div className="flex flex-1 flex-col p-4">
//           <div className="flex items-center gap-2 text-xs text-muted-foreground">
//             <span className="inline-flex items-center gap-1">
//               <Star className="size-3.5 fill-amber-400 text-amber-400" />
//               {course.rating}
//             </span>
//             <span aria-hidden="true">•</span>
//             <span>{course.level}</span>
//           </div>

//           <h3 className="mt-2 line-clamp-2 text-sm font-semibold leading-snug text-foreground text-pretty">
//             {course.title}
//           </h3>
//           <p className="mt-1 text-xs text-muted-foreground">by {course.instructor}</p>

//           <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
//             <span className="inline-flex items-center gap-1">
//               <PlayCircle className="size-3.5" />
//               {course.lessons} lessons
//             </span>
//             <span className="inline-flex items-center gap-1">
//               <Clock className="size-3.5" />
//               {course.duration}
//             </span>
//           </div>
//         </div>
//       </Link>

//       <div className="px-4 pb-4">
//         {started ? (
//           <div className="flex flex-col gap-2">
//             <div className="flex items-center justify-between text-xs">
//               <span className="font-medium text-foreground">{course.progress}% complete</span>
//               <span className="text-muted-foreground">
//                 {Math.round((course.progress / 100) * course.lessons)}/{course.lessons}
//               </span>
//             </div>
//             <ProgressBar value={course.progress} />
//             <Link href={startHref}>
//               <Button className="mt-1 h-9 w-full text-xs">Continue learning</Button>
//             </Link>
//           </div>
//         ) : (
//           <Link href={startHref}>
//             <Button variant="outline" className="h-9 w-full text-xs">
//               Start course
//             </Button>
//           </Link>
//         )}
//       </div>
//     </article>
//   )
// }



'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Clock, PlayCircle, Star } from 'lucide-react'

import type { CourseRecord } from '@/lib/learning-types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ProgressBar } from '@/components/app/progress-bar'

function getYoutubeId(url?: string | null): string {
  if (!url) return ''
  try {
    const parsed = new URL(url)
    const v = parsed.searchParams.get('v')
    if (v) return v
    if (parsed.hostname.includes('youtu.be')) return parsed.pathname.replace('/', '')
    if (parsed.pathname.includes('/embed/')) return parsed.pathname.split('/embed/')[1]
    return ''
  } catch {
    return ''
  }
}

export function CourseCard({ course }: { course: CourseRecord }) {
  const progress = Math.min(100, Math.max(0, Number(course.progress) || 0))
  const lessonCount = course.lessons || course.allCourse?.length || 0
  const started = progress > 0
  const [hovered, setHovered] = useState(false)
  const videoId = getYoutubeId(course.youtubeUrl)

  const startHref = `/courses/${course.id}?autoplay=1`

  const onEnter = useCallback(() => setHovered(true), [])
  const onLeave = useCallback(() => setHovered(false), [])

  return (
    <article
      className="group flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      <Link href={`/courses/${course.id}`} className="block">
        <div className="relative aspect-video overflow-hidden bg-muted">
          {hovered && videoId ? (
            <iframe
              className="absolute inset-0 h-full w-full"
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${videoId}&playsinline=1&modestbranding=1&rel=0`}
              title={course.title}
              allow="autoplay; encrypted-media"
              allowFullScreen
              loading="lazy"
            />
          ) : (
            <Image
              src={course.thumbnail || '/placeholder.svg'}
              alt={`${course.title} course thumbnail`}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            />
          )}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <Badge
            variant="secondary"
            className="absolute left-3 top-3 z-10 bg-card/90 shadow-sm backdrop-blur"
          >
            {course.category}
          </Badge>
        </div>

        <div className="flex flex-1 flex-col p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Star className="size-3.5 fill-amber-400 text-amber-400" />
              {course.rating}
            </span>
            <span aria-hidden="true">•</span>
            <span>{course.level}</span>
          </div>

          <h3 className="mt-2 line-clamp-2 text-pretty text-sm font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
            {course.title}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">by {course.instructor}</p>

          <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <PlayCircle className="size-3.5" />
              {lessonCount} lessons
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3.5" />
              {course.duration || 'Self-paced'}
            </span>
          </div>
        </div>
      </Link>

      <div className="px-4 pb-4">
        {started ? (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-foreground">{progress}% complete</span>
              <span className="text-muted-foreground">
                {Math.round((progress / 100) * lessonCount)}/{lessonCount}
              </span>
            </div>
            <ProgressBar value={progress} />
            <Link href={startHref}>
              <Button className="mt-1 h-9 w-full rounded-full text-xs">Continue learning</Button>
            </Link>
          </div>
        ) : (
          <Link href={startHref}>
            <Button variant="outline" className="h-9 w-full rounded-full text-xs">
              Start course
            </Button>
          </Link>
        )}
      </div>
    </article>
  )
}
