'use client'

import { memo, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, Star } from 'lucide-react'

import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation } from 'swiper/modules'

import 'swiper/css'
import 'swiper/css/navigation'
import { useFirebaseData } from '@/lib/hooks/useFirebaseData'

interface DisplayCourse {
  id: string
  title: string
  instructor: string
  image: string
  rating: number
  reviews: string
  lessons: number
}

const fallbackCourses: DisplayCourse[] = [
  {
    id: 'rec-1',
    title: 'NodeJS - The Complete Guide (MVC, REST APIs, GraphQL)',
    instructor: 'Maximilian Schwarzmüller',
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800',
    rating: 4.8,
    reviews: '55,357',
    lessons: 48,
  },
  {
    id: 'rec-2',
    title: 'Node.js Beginner to Advance Course with Projects',
    instructor: 'Hitesh Choudhary',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800',
    rating: 4.7,
    reviews: '1,739',
    lessons: 32,
  },
  {
    id: 'rec-3',
    title: 'The Ultimate React & Next.js Masterclass 2025',
    instructor: 'Jonas Schmedtmann',
    image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
    rating: 4.9,
    reviews: '26,785',
    lessons: 64,
  },
  {
    id: 'rec-4',
    title: 'Complete Full-Stack Web Development Course',
    instructor: 'Hitesh Choudhary',
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800',
    rating: 4.8,
    reviews: '18,103',
    lessons: 56,
  },
]

interface CourseSlideCardProps {
  course: DisplayCourse
}

/**
 * Extracted + memoized so Swiper's internal re-renders (e.g. on navigation,
 * resize, breakpoint changes) don't force every slide's card to re-render.
 */
const CourseSlideCard = memo(function CourseSlideCard({ course }: CourseSlideCardProps) {
  return (
    <Link href={`/courses/${course.id}`} className="group block">
      <div className="overflow-hidden rounded-2xl border border-border/50 bg-muted/20 p-3 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:bg-muted/40 hover:shadow-lg">
        <div className="relative h-36 w-full overflow-hidden rounded-xl bg-muted">
          <Image
            src={course.image}
            alt={course.title}
            fill
            loading="lazy"
            className="object-cover transition duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 250px"
          />
          <div className="absolute bottom-2 left-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur">
            {course.lessons} Lessons
          </div>
        </div>

        <div className="pt-3">
          <h3 className="line-clamp-2 text-sm font-bold text-foreground group-hover:text-primary transition-colors">
            {course.title}
          </h3>

          <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{course.instructor}</p>

          <div className="mt-2.5 flex items-center justify-between border-t border-border/40 pt-2 text-xs">
            <div className="flex items-center gap-1">
              <Star className="size-3.5 fill-amber-400 text-amber-400" aria-hidden="true" />
              <span className="font-bold text-foreground text-xs">{course.rating}</span>
              <span className="text-[11px] text-muted-foreground">({course.reviews})</span>
            </div>

            <span className="font-semibold text-primary text-xs">Start →</span>
          </div>
        </div>
      </div>
    </Link>
  )
})

export default function RecommendedCourses() {
  const { data: firebaseCourses, loading } = useFirebaseData('courses')

  // Recomputed only when the fetched course list actually changes, avoiding
  // a full remap of every course (and re-derivation of fallback images) on
  // unrelated re-renders of this component.
  const displayCourses = useMemo<DisplayCourse[]>(() => {
    if (!firebaseCourses || firebaseCourses.length === 0) return fallbackCourses

    return firebaseCourses.map((c: any, index: number) => ({
      id: c.id,
      title: c.title || c.Course || `Course ${index + 1}`,
      instructor: c.instructor || 'Expert Instructor',
      image: c.image || c.thumbnail || fallbackCourses[index % fallbackCourses.length].image,
      rating: c.rating || 4.8,
      reviews: c.reviews || `${Math.floor(1000 + (index + 1) * 342)}`,
      lessons: Array.isArray(c.allCourse) ? c.allCourse.length : c.lessons || 12,
    }))
  }, [firebaseCourses])

  return (
    <section
      className="rounded-3xl border border-border/60 bg-card p-6 shadow-sm"
      aria-busy={loading}
      aria-label="Recommended courses"
    >
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Recommended for You
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Handpicked top courses to expand your skill set
          </p>
        </div>

        <Link
          href="/courses"
          className="text-xs font-semibold text-primary transition hover:underline"
        >
          View all courses
        </Link>
      </div>

      <div className="relative">
        <button
          type="button"
          aria-label="Previous slide"
          className="recommend-prev absolute left-0 top-1/2 z-20 flex size-10 -translate-x-3 -translate-y-1/2 items-center justify-center rounded-full bg-card shadow-md ring-1 ring-border/80 text-foreground transition-all hover:scale-110 hover:bg-muted cursor-pointer"
        >
          <ChevronLeft className="size-5" aria-hidden="true" />
        </button>

        <button
          type="button"
          aria-label="Next slide"
          className="recommend-next absolute right-0 top-1/2 z-20 flex size-10 translate-x-3 -translate-y-1/2 items-center justify-center rounded-full bg-card shadow-md ring-1 ring-border/80 text-foreground transition-all hover:scale-110 hover:bg-muted cursor-pointer"
        >
          <ChevronRight className="size-5" aria-hidden="true" />
        </button>

        <Swiper
          modules={[Navigation]}
          navigation={{
            prevEl: '.recommend-prev',
            nextEl: '.recommend-next',
          }}
          spaceBetween={20}
          breakpoints={{
            320: { slidesPerView: 1.2 },
            640: { slidesPerView: 2 },
            768: { slidesPerView: 3 },
            1024: { slidesPerView: 4 },
            1400: { slidesPerView: 4 },
          }}
          aria-label="Recommended courses carousel"
        >
          {displayCourses.map((course) => (
            <SwiperSlide key={course.id}>
              <CourseSlideCard course={course} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  )
}