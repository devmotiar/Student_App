'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Play } from 'lucide-react'

export default function ContinueLearning() {
  const course = {
    title: 'React - The Complete Guide 2024',
    chapter: 'Chapter 8: State Management with Redux',
    progress: 65,
    lastWatched: 'Last watched 2 days ago',
    image:
      'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80',
  }

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">
          Continue Learning
        </h2>

        <Link
          href="/courses"
          className="text-sm font-semibold text-blue-600 hover:text-blue-700"
        >
          View all
        </Link>
      </div>

      {/* Card */}
      <div className="flex flex-col gap-6 rounded-2xl lg:flex-row">
        {/* Thumbnail */}
        <div className="relative h-44 w-full overflow-hidden rounded-2xl lg:h-40 lg:w-72">
          <Image
            src={course.image}
            alt={course.title}
            fill
            className="object-cover"
          />

          {/* Gradient */}
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/40 via-purple-500/20 to-cyan-400/20" />

          {/* Badge */}
          <div className="absolute right-3 top-3 rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white shadow">
            In Progress
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col justify-between">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">
              {course.title}
            </h3>

            <p className="mt-2 text-gray-500">
              {course.chapter}
            </p>

            {/* Progress */}
            <div className="mt-6">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  Progress
                </span>

                <span className="font-semibold text-gray-900">
                  {course.progress}%
                </span>
              </div>

              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full rounded-full bg-blue-600 transition-all"
                  style={{
                    width: `${course.progress}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Bottom */}
          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              {course.lastWatched}
            </p>

            <button className="inline-flex items-center gap-2 rounded-xl bg-blue-50 px-5 py-3 text-sm font-semibold text-blue-600 transition hover:bg-blue-100">
              <Play className="h-4 w-4 fill-current" />
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}