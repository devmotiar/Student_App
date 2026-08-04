'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Loader2, Plus, Pencil, Trash2, X, ExternalLink } from 'lucide-react'

import { useFirebaseData } from '@/lib/hooks/useFirebaseData'
import { addDocument, updateDocument, deleteDocument } from '@/lib/firebase-operations'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'

interface LiveClass {
  id: string
  title: string
  course: string
  instructor: string
  date: string
  time: string
  duration: string
  status: 'live' | 'upcoming' | 'ended'
  attendees: number
  meetingLink?: string
  recordingUrl?: string
  description?: string
}

const emptyForm = {
  title: '',
  course: '',
  instructor: '',
  date: '',
  time: '',
  duration: '',
  status: 'upcoming' as LiveClass['status'],
  attendees: 0,
  meetingLink: '',
  recordingUrl: '',
  description: '',
}

export default function AdminLiveClassesPage() {
  const { data: liveClasses, loading } = useFirebaseData<LiveClass>('liveClasses')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const openCreate = () => {
    setEditingId(null)
    setForm(emptyForm)
    setError('')
    setShowForm(true)
  }

  const openEdit = (cls: LiveClass) => {
    setEditingId(cls.id)
    setForm({
      title: cls.title || '',
      course: cls.course || '',
      instructor: cls.instructor || '',
      date: cls.date || '',
      time: cls.time || '',
      duration: cls.duration || '',
      status: cls.status || 'upcoming',
      attendees: cls.attendees || 0,
      meetingLink: cls.meetingLink || '',
      recordingUrl: cls.recordingUrl || '',
      description: cls.description || '',
    })
    setError('')
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim() || !form.course.trim() || !form.instructor.trim()) {
      setError('Title, course, and instructor are required.')
      return
    }
    setSaving(true)
    setError('')
    try {
      const payload = { ...form, attendees: Number(form.attendees) || 0 }
      if (editingId) {
        await updateDocument('liveClasses', editingId, payload)
      } else {
        await addDocument('liveClasses', payload)
      }
      setShowForm(false)
      setForm(emptyForm)
      setEditingId(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save live class')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this live class? This cannot be undone.')) return
    setDeletingId(id)
    try {
      await deleteDocument('liveClasses', id)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete live class')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-foreground">Live Classes</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Add, edit, or remove live class sessions and meeting links.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="size-4 mr-1.5" /> New Live Class
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-foreground">
              {editingId ? 'Edit Live Class' : 'New Live Class'}
            </h2>
            <button
              onClick={() => setShowForm(false)}
              className="text-muted-foreground hover:text-foreground"
              aria-label="Close form"
            >
              <X className="size-5" />
            </button>
          </div>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2 flex flex-col gap-1.5">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="course">Course *</Label>
              <Input
                id="course"
                value={form.course}
                onChange={(e) => setForm({ ...form, course: e.target.value })}
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="instructor">Instructor *</Label>
              <Input
                id="instructor"
                value={form.instructor}
                onChange={(e) => setForm({ ...form, instructor: e.target.value })}
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="date">Date (display text)</Label>
              <Input
                id="date"
                placeholder="e.g. Today, Jun 12"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="time">Time</Label>
              <Input
                id="time"
                placeholder="e.g. 2:00 PM"
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="duration">Duration</Label>
              <Input
                id="duration"
                placeholder="e.g. 60 min"
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: e.target.value })}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as LiveClass['status'] })}
                className="h-11 w-full rounded-lg border border-input bg-card px-3.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/25"
              >
                <option value="upcoming">Upcoming</option>
                <option value="live">Live</option>
                <option value="ended">Ended</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="attendees">Attendees</Label>
              <Input
                id="attendees"
                type="number"
                min={0}
                value={form.attendees}
                onChange={(e) => setForm({ ...form, attendees: Number(e.target.value) })}
              />
            </div>

            <div className="sm:col-span-2 flex flex-col gap-1.5">
              <Label htmlFor="meetingLink">
                Meeting link (Zoom / Google Meet / Teams URL — students are redirected here)
              </Label>
              <Input
                id="meetingLink"
                type="url"
                placeholder="https://meet.google.com/xxx-xxxx-xxx"
                value={form.meetingLink}
                onChange={(e) => setForm({ ...form, meetingLink: e.target.value })}
              />
            </div>

            <div className="sm:col-span-2 flex flex-col gap-1.5">
              <Label htmlFor="recordingUrl">Recording URL (optional, shown once class has ended)</Label>
              <Input
                id="recordingUrl"
                type="url"
                placeholder="https://..."
                value={form.recordingUrl}
                onChange={(e) => setForm({ ...form, recordingUrl: e.target.value })}
              />
            </div>

            <div className="sm:col-span-2 flex flex-col gap-1.5">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full rounded-lg border border-input bg-card px-3.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/25"
              />
            </div>

            <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="size-4 animate-spin mr-1.5" />}
                {editingId ? 'Save Changes' : 'Create Live Class'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      ) : liveClasses.length === 0 ? (
        <Card className="p-8 text-center text-sm text-muted-foreground">
          No live classes yet. Click &quot;New Live Class&quot; to add one.
        </Card>
      ) : (
        <Card className="divide-y divide-border">
          {liveClasses.map((cls) => (
            <div
              key={cls.id}
              className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-foreground text-pretty">{cls.title}</h3>
                  <Badge variant={cls.status === 'live' ? 'live' : 'secondary'}>{cls.status}</Badge>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {cls.course} • {cls.instructor} • {cls.date} {cls.time}
                </p>
                {cls.meetingLink && (
                  <a
                    href={cls.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    Meeting link <ExternalLink className="size-3" />
                  </a>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Link href={`/live-classes/${cls.id}`} target="_blank">
                  <Button variant="ghost" size="sm">
                    Preview
                  </Button>
                </Link>
                <Button variant="outline" size="sm" onClick={() => openEdit(cls)}>
                  <Pencil className="size-3.5 mr-1" /> Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(cls.id)}
                  disabled={deletingId === cls.id}
                >
                  {deletingId === cls.id ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="size-3.5" />
                  )}
                </Button>
              </div>
            </div>
          ))}
        </Card>
      )}
    </div>
  )
}
