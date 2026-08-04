# Firebase Operations - Code Examples

Common patterns and examples for working with Firebase in the LMS.

## 🎣 Using Real-Time Hooks

### Basic: Fetch All Courses

```typescript
'use client'

import { useFirebaseData } from '@/lib/hooks/useFirebaseData'

export default function CoursesPage() {
  const { data: courses, loading, error } = useFirebaseData('courses')

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <div>
      {courses.map((course) => (
        <div key={course.id}>
          <h3>{course.title}</h3>
          <p>{course.instructor}</p>
        </div>
      ))}
    </div>
  )
}
```

### With Filtering: In-Progress Courses Only

```typescript
const { data: courses } = useFirebaseData('courses')

// Client-side filter
const inProgress = courses.filter((c) => c.progress > 0 && c.progress < 100)
```

### With Query Constraints (Server-side Filter)

```typescript
import { where } from 'firebase/firestore'
import { useFirebaseData } from '@/lib/hooks/useFirebaseData'

export default function BeginnerCoursesPage() {
  const { data: courses } = useFirebaseData(
    'courses',
    where('level', '==', 'Beginner')
  )

  // Only Beginner level courses loaded
}
```

### Multiple Collections

```typescript
'use client'

import { useFirebaseData } from '@/lib/hooks/useFirebaseData'

export default function DashboardPage() {
  const { data: courses, loading: coursesLoading } = useFirebaseData('courses')
  const { data: liveClasses, loading: classesLoading } = useFirebaseData('liveClasses')
  const { data: videos, loading: videosLoading } = useFirebaseData('recordedVideos')

  const allLoading = coursesLoading || classesLoading || videosLoading

  if (allLoading) return <div>Loading...</div>

  return (
    <div>
      <h1>Courses: {courses.length}</h1>
      <h1>Live Classes: {liveClasses.length}</h1>
      <h1>Videos: {videos.length}</h1>
    </div>
  )
}
```

### Specific Document

```typescript
import { useFirebaseDocument } from '@/lib/hooks/useFirebaseData'

export default function CoursePage({ courseId }) {
  const { data: course, loading } = useFirebaseDocument('courses', courseId)

  if (loading) return <div>Loading...</div>

  return (
    <div>
      <h1>{course.title}</h1>
      <p>By: {course.instructor}</p>
      <p>Progress: {course.progress}%</p>
    </div>
  )
}
```

## ✍️ Creating Data

### Add a New Course

```typescript
import { addDocument } from '@/lib/firebase-operations'

async function createCourse() {
  try {
    const courseId = await addDocument('courses', {
      title: 'Advanced TypeScript',
      instructor: 'John Doe',
      category: 'Development',
      level: 'Advanced',
      lessons: 50,
      duration: '25h',
      progress: 0,
      rating: 0,
      students: 0,
      image: '/courses/typescript.png',
    })
    console.log('Course created:', courseId)
  } catch (error) {
    console.error('Error creating course:', error)
  }
}
```

### Using in a Form

```typescript
'use client'

import { useState } from 'react'
import { addDocument } from '@/lib/firebase-operations'

export default function AddCourseForm() {
  const [title, setTitle] = useState('')
  const [instructor, setInstructor] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)

    try {
      await addDocument('courses', {
        title,
        instructor,
        category: 'Development',
        level: 'Beginner',
        lessons: 0,
        duration: '0h',
        progress: 0,
        rating: 0,
        students: 0,
        image: '/placeholder.png',
      })
      alert('Course created!')
      setTitle('')
      setInstructor('')
    } catch (error) {
      alert('Error: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Course Title"
        required
      />
      <input
        value={instructor}
        onChange={(e) => setInstructor(e.target.value)}
        placeholder="Instructor"
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create Course'}
      </button>
    </form>
  )
}
```

## ✏️ Updating Data

### Update Course Progress

```typescript
import { updateCourseProgress } from '@/lib/firebase-operations'

async function completeLesson(userId, courseId) {
  try {
    // Get current progress first (in real app, might get from state)
    const newProgress = 75

    await updateCourseProgress(userId, courseId, newProgress)
    console.log('Progress updated!')
  } catch (error) {
    console.error('Error updating progress:', error)
  }
}
```

### Update Generic Document

```typescript
import { updateDocument } from '@/lib/firebase-operations'

async function updateCourseDetails(courseId) {
  try {
    await updateDocument('courses', courseId, {
      rating: 4.8,
      students: 15000,
      lessons: 45,
    })
    console.log('Course updated!')
  } catch (error) {
    console.error('Error updating course:', error)
  }
}
```

### In a Button Click

```typescript
'use client'

import { useState } from 'react'
import { updateCourseProgress } from '@/lib/firebase-operations'

export default function ProgressButton({ userId, courseId, currentProgress }) {
  const [loading, setLoading] = useState(false)

  async function handleProgress() {
    setLoading(true)
    try {
      await updateCourseProgress(userId, courseId, currentProgress + 10)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button onClick={handleProgress} disabled={loading}>
      {loading ? 'Updating...' : 'Next Lesson'}
    </button>
  )
}
```

## 🗑️ Deleting Data

### Delete a Course

```typescript
import { deleteDocument } from '@/lib/firebase-operations'

async function removeCourse(courseId) {
  if (confirm('Are you sure?')) {
    try {
      await deleteDocument('courses', courseId)
      console.log('Course deleted!')
    } catch (error) {
      console.error('Error deleting course:', error)
    }
  }
}
```

## 🎥 Video Operations

### Mark Video as Watched

```typescript
import { markVideoWatched } from '@/lib/firebase-operations'

async function onVideoComplete(userId, videoId) {
  try {
    await markVideoWatched(userId, videoId)
    console.log('Video marked as watched!')
  } catch (error) {
    console.error('Error:', error)
  }
}
```

### In a Video Player Component

```typescript
'use client'

import { markVideoWatched } from '@/lib/firebase-operations'

export default function VideoPlayer({ userId, videoId, title }) {
  function handleVideoEnded() {
    markVideoWatched(userId, videoId)
  }

  return (
    <div>
      <h2>{title}</h2>
      <video
        width="100%"
        onEnded={handleVideoEnded}
      >
        <source src="/video.mp4" type="video/mp4" />
      </video>
    </div>
  )
}
```

## 🎓 Live Class Operations

### Join a Live Class

```typescript
import { incrementLiveClassAttendees } from '@/lib/firebase-operations'

async function joinLiveClass(userId, liveClassId) {
  try {
    await incrementLiveClassAttendees(liveClassId)
    console.log('Joined class!')
  } catch (error) {
    console.error('Error joining class:', error)
  }
}
```

### Join Button Component

```typescript
'use client'

import { useState } from 'react'
import { incrementLiveClassAttendees } from '@/lib/firebase-operations'

export default function JoinClassButton({ liveClassId, attendees }) {
  const [loading, setLoading] = useState(false)
  const [joined, setJoined] = useState(false)

  async function handleJoin() {
    setLoading(true)
    try {
      await incrementLiveClassAttendees(liveClassId)
      setJoined(true)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <p>{attendees} attending</p>
      <button
        onClick={handleJoin}
        disabled={loading || joined}
      >
        {joined ? 'Joined ✓' : loading ? 'Joining...' : 'Join Class'}
      </button>
    </div>
  )
}
```

## 🔍 Advanced: Query with Multiple Conditions

```typescript
import { where, orderBy } from 'firebase/firestore'
import { useFirebaseData } from '@/lib/hooks/useFirebaseData'

export default function AdvancedCoursesPage() {
  // Get intermediate development courses, ordered by rating
  const { data: courses } = useFirebaseData(
    'courses',
    where('level', '==', 'Intermediate'),
    where('category', '==', 'Development'),
    orderBy('rating', 'desc')
  )

  return (
    <div>
      {courses.map((course) => (
        <div key={course.id}>
          <h3>{course.title}</h3>
          <p>Rating: {course.rating}</p>
        </div>
      ))}
    </div>
  )
}
```

## 🚨 Error Handling

### Complete Error Handling Example

```typescript
'use client'

import { useEffect, useState } from 'react'
import { useFirebaseData } from '@/lib/hooks/useFirebaseData'

export default function CoursesWithErrorHandling() {
  const { data: courses, loading, error } = useFirebaseData('courses')
  const [retrying, setRetrying] = useState(false)

  function handleRetry() {
    setRetrying(true)
    // Refetch will happen automatically due to hook dependency
    setTimeout(() => setRetrying(false), 1000)
  }

  if (loading) {
    return <div className="loading">Loading courses...</div>
  }

  if (error) {
    return (
      <div className="error">
        <p>Error loading courses: {error.message}</p>
        <button onClick={handleRetry} disabled={retrying}>
          {retrying ? 'Retrying...' : 'Retry'}
        </button>
      </div>
    )
  }

  if (courses.length === 0) {
    return <div className="empty">No courses found</div>
  }

  return (
    <div className="courses">
      {courses.map((course) => (
        <div key={course.id}>{course.title}</div>
      ))}
    </div>
  )
}
```

## 📱 Building a Simple CRUD App

```typescript
'use client'

import { useState } from 'react'
import { useFirebaseData } from '@/lib/hooks/useFirebaseData'
import { addDocument, updateDocument, deleteDocument } from '@/lib/firebase-operations'

export default function CourseCRUD() {
  const { data: courses, loading } = useFirebaseData('courses')
  const [newTitle, setNewTitle] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editTitle, setEditTitle] = useState('')

  async function handleAdd() {
    if (!newTitle.trim()) return
    await addDocument('courses', {
      title: newTitle,
      instructor: 'Unknown',
      category: 'Development',
      level: 'Beginner',
      lessons: 0,
      duration: '0h',
      progress: 0,
      rating: 0,
      students: 0,
      image: '/placeholder.png',
    })
    setNewTitle('')
  }

  async function handleUpdate(courseId) {
    if (!editTitle.trim()) return
    await updateDocument('courses', courseId, { title: editTitle })
    setEditingId(null)
    setEditTitle('')
  }

  async function handleDelete(courseId) {
    if (confirm('Delete this course?')) {
      await deleteDocument('courses', courseId)
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div>
      {/* Add */}
      <div>
        <input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="New course"
        />
        <button onClick={handleAdd}>Add</button>
      </div>

      {/* List */}
      <ul>
        {courses.map((course) => (
          <li key={course.id}>
            {editingId === course.id ? (
              <>
                <input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                />
                <button onClick={() => handleUpdate(course.id)}>Save</button>
              </>
            ) : (
              <>
                <span>{course.title}</span>
                <button onClick={() => {
                  setEditingId(course.id)
                  setEditTitle(course.title)
                }}>Edit</button>
                <button onClick={() => handleDelete(course.id)}>Delete</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
```

## 💡 Tips & Best Practices

1. **Always use loading state** - Show spinners while fetching
2. **Handle errors gracefully** - Don't let users see raw errors
3. **Client components for real-time** - Use `'use client'` for hooks
4. **Batch operations** - Combine multiple updates when possible
5. **Security** - Never trust client data, validate server-side
6. **Pagination** - For large collections, implement pagination
7. **Caching** - Consider caching frequently accessed data
8. **Offline** - Firebase has offline support, enable if needed

---

For more examples and patterns, check the actual page implementations in `app/(app)/*`.
