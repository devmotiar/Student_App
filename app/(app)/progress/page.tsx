'use client'

import { useState, useEffect } from 'react'
import { Loader2, TrendingUp, Award, Clock, BookOpen, CheckCircle2 } from 'lucide-react'

import { useAuth } from '@/lib/hooks/useAuth'
import { getLearningStats } from '@/lib/firebase-progress-operations'
import { PageHeader } from '@/components/app/page-header'
import { Card } from '@/components/ui/card'

export default function ProgressPage() {
  const { user, loading: authLoading } = useAuth()
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user || authLoading) return

    const fetchStats = async () => {
      try {
        const learningStats = await getLearningStats(user.uid)
        setStats(learningStats)
      } catch (err) {
        console.error('[v0] Failed to fetch stats:', err)
        setError('Failed to load learning statistics')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [user, authLoading])

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Please sign in to view your progress</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Your Learning Progress"
        description="Track your learning journey and achievements."
      />

      {error && (
        <div className="bg-red-50 dark:bg-red-950 rounded-lg p-4 mb-6">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 dark:bg-blue-950 rounded-lg">
              <BookOpen className="size-5 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-sm text-muted-foreground">Courses</p>
          </div>
          <p className="text-3xl font-bold text-foreground">{stats?.totalCourses || 0}</p>
          <p className="text-xs text-muted-foreground mt-2">
            {stats?.completedCourses || 0} completed
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-950 rounded-lg">
              <CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="text-sm text-muted-foreground">In Progress</p>
          </div>
          <p className="text-3xl font-bold text-foreground">{stats?.inProgressCourses || 0}</p>
          <p className="text-xs text-muted-foreground mt-2">
            {Math.round(stats?.averageProgress || 0)}% average
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 dark:bg-purple-950 rounded-lg">
              <Award className="size-5 text-purple-600 dark:text-purple-400" />
            </div>
            <p className="text-sm text-muted-foreground">Achievements</p>
          </div>
          <p className="text-3xl font-bold text-foreground">{stats?.achievements || 0}</p>
          <p className="text-xs text-muted-foreground mt-2">Keep learning to earn more</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-100 dark:bg-orange-950 rounded-lg">
              <Clock className="size-5 text-orange-600 dark:text-orange-400" />
            </div>
            <p className="text-sm text-muted-foreground">Learning Time</p>
          </div>
          <p className="text-3xl font-bold text-foreground">{stats?.totalWatchTime || 0}h</p>
          <p className="text-xs text-muted-foreground mt-2">
            {stats?.totalVideosWatched || 0} videos watched
          </p>
        </Card>
      </div>

      {/* Progress Details */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Overall Progress */}
        <Card className="p-6">
          <h2 className="font-semibold text-foreground mb-4">Overall Progress</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Courses Completed</span>
                <span className="text-sm text-muted-foreground">
                  {stats?.completedCourses}/{stats?.totalCourses}
                </span>
              </div>
              <div className="w-full bg-border rounded-full h-2">
                <div
                  className="bg-emerald-600 h-2 rounded-full transition-all"
                  style={{
                    width: `${stats?.totalCourses ? (stats.completedCourses / stats.totalCourses) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Average Course Progress</span>
                <span className="text-sm text-muted-foreground">{stats?.averageProgress || 0}%</span>
              </div>
              <div className="w-full bg-border rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${stats?.averageProgress || 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Videos Completed</span>
                <span className="text-sm text-muted-foreground">{stats?.totalVideosWatched || 0}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Total watch time: {stats?.totalWatchTime || 0} hours
              </p>
            </div>
          </div>
        </Card>

        {/* Achievements */}
        <Card className="p-6">
          <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Award className="size-5" />
            Achievements & Badges
          </h2>
          
          {stats?.achievements > 0 ? (
            <div className="space-y-3">
              {[...Array(Math.min(stats.achievements, 3))].map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/30 dark:to-orange-950/30 rounded-lg">
                  <div className="text-2xl">⭐</div>
                  <div className="flex-1">
                    <p className="font-medium text-sm text-foreground">Achievement {i + 1}</p>
                    <p className="text-xs text-muted-foreground">Milestone reached</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Award className="size-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground mb-2">No achievements yet</p>
              <p className="text-xs text-muted-foreground">Complete courses and videos to earn badges</p>
            </div>
          )}
        </Card>
      </div>

      {/* Learning Insights */}
      <Card className="p-6 mt-6">
        <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <TrendingUp className="size-5" />
          Learning Insights
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Current Streak</p>
            <p className="text-2xl font-bold text-foreground">Consistency matters!</p>
            <p className="text-xs text-muted-foreground mt-2">Keep learning daily to build your streak</p>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Recommended Next</p>
            <p className="text-2xl font-bold text-foreground">
              {stats?.inProgressCourses > 0 ? 'Continue' : 'Explore'}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              {stats?.inProgressCourses > 0
                ? 'Finish your current courses'
                : 'Start a new course today'}
            </p>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Learning Pace</p>
            <p className="text-2xl font-bold text-foreground">
              {stats?.totalWatchTime > 10 ? 'Excellent' : stats?.totalWatchTime > 5 ? 'Good' : 'Just started'}
            </p>
            <p className="text-xs text-muted-foreground mt-2">You're making great progress!</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
