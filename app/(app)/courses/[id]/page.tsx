import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, Users, Star, CheckCircle2 } from 'lucide-react'

import { getAllCourses, getCourseById } from '@/lib/firebase/courses'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CoursePlayerPanel } from '@/components/app/course-player-panel'
// import { CourseEnrollSidebar } from '@/components/app/course-enroll-sidebar'

import {CourseEnrollSidebar} from '@/components/app/course-enroll-sidebar'

interface PageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ lesson?: string; autoplay?: string }>
}

// Pre-render known course pages at build time; anything new falls back to
// on-demand SSR and gets cached (ISR) after first hit.
export async function generateStaticParams() {
  const courses = await getAllCourses()
  return courses.map((c) => ({ id: c.id }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const course = await getCourseById(id)
  if (!course) return { title: 'Course not found' }

  return {
    title: `${course.title} | Learn`,
    description: course.description,
    openGraph: {
      title: course.title,
      description: course.description,
      images: course.thumbnail ? [{ url: course.thumbnail }] : undefined,
      type: 'website',
    },
  }
}

export default async function CourseDetailPage({ params, searchParams }: PageProps) {
  const { id } = await params
  const { lesson, autoplay } = await searchParams

  const course = await getCourseById(id)
  if (!course) notFound()

  const requestedLessonId = lesson ?? course.lessons?.[0]?.id
  const shouldAutoplay = autoplay === '1'

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6">
        <Link href="/courses">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="size-4 mr-2" />
            Back to Courses
          </Button>
        </Link>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2">
          <div className="mb-8">
            <div className="flex items-start gap-3 mb-4">
              <Badge>{course.level}</Badge>
              <Badge variant="secondary">{course.category}</Badge>
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-3">{course.title}</h1>
            <p className="text-lg text-muted-foreground mb-4">by {course.instructor}</p>

            <div className="flex gap-6 mb-6">
              <div className="flex items-center gap-2">
                <Star className="size-5 text-yellow-500 fill-yellow-500" />
                <span className="font-semibold">{course.rating}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="size-5 text-muted-foreground" />
                <span className="text-muted-foreground">
                     {course.students?.toLocaleString() ?? "0"} students
                </span>
              </div>
            </div>
          </div>

          <Card className="p-6 mb-8">
            <h2 className="font-heading text-xl font-bold mb-3">Course Overview</h2>
            <p className="text-foreground">{course.longDescription ?? course.description}</p>
          </Card>

          {!!course.learningOutcomes?.length && (
            <Card className="p-6 mb-8">
              <h2 className="font-heading text-xl font-bold mb-4">What you&apos;ll learn</h2>
              <ul className="space-y-3">
                {course.learningOutcomes.map((outcome) => (
                  <li key={outcome} className="flex gap-3">
                    <CheckCircle2 className="size-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span className="text-foreground">{outcome}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {!!course.requirements?.length && (
            <Card className="p-6 mb-8">
              <h2 className="font-heading text-xl font-bold mb-4">Requirements</h2>
              <ul className="space-y-2">
                {course.requirements.map((req) => (
                  <li key={req} className="flex gap-2 text-foreground">
                    <span className="text-primary">•</span>
                    {req}
                  </li>
                ))}
              </ul>
            </Card>
          )}

          <CoursePlayerPanel
            course={course}
            initialLessonId={requestedLessonId}
            autoplay={shouldAutoplay}
          />
        </div>

        <div>
          <CourseEnrollSidebar course={course} />
        </div>
      </div>
    </div>
  )
}