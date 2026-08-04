'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, Star } from 'lucide-react'

import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation } from 'swiper/modules'

import 'swiper/css'
import 'swiper/css/navigation'

const courses = [
  {
    id: 1,
    title: 'NodeJS - The Complete Guide (MVC, REST APIs, GraphQL)',
    instructor: 'Maximilian Schwarzmüller',
    image:
      'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800',
    rating: 4.6,
    reviews: '55,357',
  },
  {
    id: 2,
    title: 'Node.js Beginner to Advance Course with Projects',
    instructor: 'Hitesh Choudhary',
    image:
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800',
    rating: 4.4,
    reviews: '1,739',
  },
  {
    id: 3,
    title: 'The Ultimate React Course 2025',
    instructor: 'Jonas Schmedtmann',
    image:
      'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
    rating: 4.7,
    reviews: '26,785',
  },
  {
    id: 4,
    title: 'Complete React & Next.js Course',
    instructor: 'Hitesh Choudhary',
    image:
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800',
    rating: 4.6,
    reviews: '1,103',
  },
  {
    id: 5,
    title: 'Complete Web Development Course',
    instructor: 'Hitesh Choudhary',
    image:
      'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800',
    rating: 4.5,
    reviews: '22,050',
  },
   {
    id: 6,
    title: 'Complete Web Development Course',
    instructor: 'Hitesh Choudhary',
    image:
      'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800',
    rating: 4.5,
    reviews: '22,050',
  },

  {
    id: 7,
    title: 'Complete Web Development Course',
    instructor: 'Hitesh Choudhary',
    image:
      'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800',
    rating: 4.5,
    reviews: '22,050',
  },

  

]

export default function RecommendedCourses() {
  return (
    <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Recommended for You
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Continue your learning journey
          </p>
        </div>

        <Link
          href="/courses"
          className="font-semibold text-blue-600 hover:text-blue-700"
        >
          View all
        </Link>
      </div>

      <div className="relative">
        <button className="recommend-prev absolute left-0 top-1/2 z-20 flex h-11 w-11 -translate-x-5 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-lg ring-1 ring-gray-200 cursor-pointer">
          <ChevronLeft className="h-5 w-5" />
        </button>

        <button className="recommend-next absolute right-0 top-1/2 z-20 flex h-11 w-11 translate-x-5 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-lg ring-1 ring-gray-200 cursor-pointer">
          <ChevronRight className="h-5 w-5" />
        </button>

        <Swiper
          modules={[Navigation]}
          navigation={{
            prevEl: '.recommend-prev',
            nextEl: '.recommend-next',
          }}
          spaceBetween={22}
          breakpoints={{
            320: {
              slidesPerView: 1.2,
            },
            640: {
              slidesPerView: 2,
            },
            768: {
              slidesPerView: 3,
            },
            1024: {
              slidesPerView: 4,
            },
            1400: {
              slidesPerView: 4,
            },
          }}
        >
          {courses.map((course) => (
            <SwiperSlide key={course.id}>
              <div className="group overflow-hidden rounded-2xl transition hover:-translate-y-1">
                <div className="relative h-40 overflow-hidden rounded-xl">
                  <Image
                    src={course.image}
                    alt={course.title}
                    fill
                    className="object-cover transition duration-300 group-hover:scale-105"
                  />
                </div>

                <div className="pt-3">
                  <h3 className="line-clamp-2 font-bold leading-6 text-gray-900">
                    {course.title}
                  </h3>

                  <p className="mt-2 text-sm text-gray-500">
                    {course.instructor}
                  </p>

                  <div className="mt-3 flex items-center gap-2">
                    <span className="font-semibold text-amber-700">
                      {course.rating}
                    </span>

                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className="h-4 w-4 fill-amber-400 text-amber-400"
                        />
                      ))}
                    </div>

                    <span className="text-sm text-gray-500">
                      ({course.reviews})
                    </span>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  )
}