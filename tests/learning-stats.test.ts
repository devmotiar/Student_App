import { describe, expect, it } from 'vitest'

import {
  calculateHybridLearnedHours,
  calculateLearningStats,
  formatLearningHours,
  getCourseProgressStatus,
  parseDurationToHours,
} from '@/lib/firebase-progress-operations'

describe('learning metrics', () => {
  it('parses supported course durations without a fallback duration', () => {
    expect(parseDurationToHours('18h 30m')).toBe(18.5)
    expect(parseDurationToHours('90 min')).toBe(1.5)
    expect(parseDurationToHours('')).toBe(0)
  })

  it('uses the larger hybrid metric and caps it at course duration', () => {
    expect(calculateHybridLearnedHours(50, '10h', 0)).toBe(5)
    expect(calculateHybridLearnedHours(10, '10h', 12 * 3600)).toBe(10)
    expect(calculateHybridLearnedHours(50, undefined, 8 * 3600)).toBe(0)
  })

  it('keeps short learning sessions visible', () => {
    expect(formatLearningHours(92 / 3600)).toBe('0.03')
    expect(formatLearningHours(0)).toBe('0')
  })

  it('keeps progress status boundaries exact', () => {
    expect(getCourseProgressStatus(0)).toBe('In Progress')
    expect(getCourseProgressStatus(99.99)).toBe('In Progress')
    expect(getCourseProgressStatus(100)).toBe('Completed')
  })

  it('counts unique enrolled IDs and ignores progress records outside enrollment', () => {
    const stats = calculateLearningStats(
      [
        { courseId: 'course-a', progress: 100, status: 'completed' },
        { courseId: 'course-b', progress: 25, status: 'in-progress' },
        { courseId: 'not-enrolled', progress: 100, status: 'completed' },
      ],
      [],
      [
        { id: 'course-a', duration: '10h' },
        { id: 'course-b', duration: '20h' },
      ],
      ['course-a', 'course-a', 'course-b']
    )

    expect(stats.totalCourses).toBe(2)
    expect(stats.completedCourses).toBe(1)
    expect(stats.inProgressCourses).toBe(1)
    expect(stats.totalLearnedHours).toBe(15)
  })

  it('counts exact watch time for an enrolled course before course progress exists', () => {
    const stats = calculateLearningStats(
      [],
      [
        {
          videoId: 'lesson-1',
          courseId: 'course-a',
          progress: 92,
          duration: 279,
          completed: false,
          totalWatchTime: 92,
        },
      ],
      [{ id: 'course-a', duration: '10h' }],
      ['course-a']
    )

    expect(stats.totalCourses).toBe(1)
    expect(stats.inProgressCourses).toBe(1)
    expect(stats.totalLearnedHours).toBe(0.03)
  })
})
