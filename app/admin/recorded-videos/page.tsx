'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { Loader2, Plus, Pencil, Trash2, X, UploadCloud, Link2 } from 'lucide-react'

import { useFirebaseData } from '@/lib/hooks/useFirebaseData'
import { addDocument, updateDocument, deleteDocument } from '@/lib/firebase-operations'
import { uploadRecordedVideo, uploadThumbnail, deleteFileByUrl } from '@/lib/firebase-storage-operations'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface RecordedVideo {
  id: string
  title: string
  course: string
  instructor: string
  duration: string
  views: number
  uploaded: string
  videoUrl?: string
  image?: string
  description?: string
}

const emptyForm = {
  title: '',
  course: '',
  instructor: '',
  duration: '',
  videoUrl: '',
  image: '',
  description: '',
}

export default function AdminRecordedVideosPage() {
  const { data: videos, loading } = useFirebaseData<RecordedVideo>('recordedVideos')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [sourceMode, setSourceMode] = useState<'upload' | 'url'>('url')
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [thumbFile, setThumbFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const thumbInputRef = useRef<HTMLInputElement>(null)

  const openCreate = () => {
    setEditingId(null)
    setForm(emptyForm)
    setSourceMode('url')
    setVideoFile(null)
    setThumbFile(null)
    setError('')
    setShowForm(true)
  }

  const openEdit = (video: RecordedVideo) => {
    setEditingId(video.id)
    setForm({
      title: video.title || '',
      course: video.course || '',
      instructor: video.instructor || '',
      duration: video.duration || '',
      videoUrl: video.videoUrl || '',
      image: video.image || '',
      description: video.description || '',
    })
    setSourceMode('url')
    setVideoFile(null)
    setThumbFile(null)
    setError('')
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim() || !form.course.trim() || !form.instructor.trim()) {
      setError('Title, course, and instructor are required.')
      return
    }
    if (sourceMode === 'url' && !form.videoUrl.trim() && !editingId) {
      setError('Provide a video URL, or switch to file upload.')
      return
    }
    if (sourceMode === 'upload' && !videoFile && !editingId) {
      setError('Choose a video file to upload.')
      return
    }

    setSaving(true)
    setError('')
    setUploadProgress(0)
    try {
      let docId = editingId
      let videoUrl = form.videoUrl
      let image = form.image

      // Create/update the Firestore document first so we have an id to namespace uploads under
      if (!docId) {
        docId = await addDocument('recordedVideos', {
          title: form.title,
          course: form.course,
          instructor: form.instructor,
          duration: form.duration || '0:00',
          views: 0,
          uploaded: 'just now',
          videoUrl: '',
          image: image || '',
          description: form.description,
          watched: false,
        })
      }

      if (sourceMode === 'upload' && videoFile) {
        videoUrl = await uploadRecordedVideo(videoFile, docId, setUploadProgress)
      }
      if (thumbFile) {
        image = await uploadThumbnail(thumbFile, 'recorded-videos', docId)
      }

      await updateDocument('recordedVideos', docId, {
        title: form.title,
        course: form.course,
        instructor: form.instructor,
        duration: form.duration || '0:00',
        videoUrl,
        image,
        description: form.description,
      })

      setShowForm(false)
      setForm(emptyForm)
      setVideoFile(null)
      setThumbFile(null)
      setEditingId(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save video')
    } finally {
      setSaving(false)
      setUploadProgress(0)
    }
  }

  const handleDelete = async (video: RecordedVideo) => {
    if (!confirm('Delete this video? This cannot be undone.')) return
    setDeletingId(video.id)
    try {
      await deleteDocument('recordedVideos', video.id)
      if (video.videoUrl) await deleteFileByUrl(video.videoUrl)
      if (video.image) await deleteFileByUrl(video.image)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete video')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-foreground">Recorded Videos</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Upload video files to Firebase Storage, or link to an external video URL.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="size-4 mr-1.5" /> New Video
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-foreground">{editingId ? 'Edit Video' : 'New Video'}</h2>
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
              <Label htmlFor="duration">Duration (e.g. 24:15)</Label>
              <Input
                id="duration"
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: e.target.value })}
              />
            </div>

            <div className="sm:col-span-2">
              <Label className="mb-2 block">Video source</Label>
              <div className="mb-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setSourceMode('url')}
                  className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium ${
                    sourceMode === 'url'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border text-muted-foreground'
                  }`}
                >
                  <Link2 className="size-3.5" /> External URL
                </button>
                <button
                  type="button"
                  onClick={() => setSourceMode('upload')}
                  className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium ${
                    sourceMode === 'upload'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border text-muted-foreground'
                  }`}
                >
                  <UploadCloud className="size-3.5" /> Upload File
                </button>
              </div>

              {sourceMode === 'url' ? (
                <Input
                  type="url"
                  placeholder="https://... (mp4, or a hosted stream URL)"
                  value={form.videoUrl}
                  onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                />
              ) : (
                <div>
                  <input
                    ref={videoInputRef}
                    type="file"
                    accept="video/*"
                    onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                    className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-2 file:text-xs file:font-medium file:text-primary-foreground"
                  />
                  {videoFile && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Selected: {videoFile.name} ({(videoFile.size / 1024 / 1024).toFixed(1)} MB)
                    </p>
                  )}
                  {editingId && form.videoUrl && !videoFile && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Current file is kept unless you choose a new one.
                    </p>
                  )}
                  {saving && uploadProgress > 0 && (
                    <div className="mt-2 h-1.5 w-full rounded-full bg-border">
                      <div
                        className="h-1.5 rounded-full bg-primary transition-all"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="sm:col-span-2 flex flex-col gap-1.5">
              <Label>Thumbnail image (optional)</Label>
              <input
                ref={thumbInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => setThumbFile(e.target.files?.[0] || null)}
                className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-secondary file:px-3 file:py-2 file:text-xs file:font-medium file:text-secondary-foreground"
              />
              <p className="text-xs text-muted-foreground">
                Or paste an image URL directly:
              </p>
              <Input
                placeholder="/courses/web-development.png or https://..."
                value={form.image}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
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
                {saving && sourceMode === 'upload' && uploadProgress > 0
                  ? `Uploading ${Math.round(uploadProgress)}%`
                  : editingId
                    ? 'Save Changes'
                    : 'Create Video'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      ) : videos.length === 0 ? (
        <Card className="p-8 text-center text-sm text-muted-foreground">
          No videos yet. Click &quot;New Video&quot; to add one.
        </Card>
      ) : (
        <Card className="divide-y divide-border">
          {videos.map((video) => (
            <div
              key={video.id}
              className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-foreground text-pretty">{video.title}</h3>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {video.course} • {video.instructor} • {video.duration}
                </p>
                {!video.videoUrl && (
                  <p className="mt-1 text-xs font-medium text-destructive">No video file linked</p>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Link href={`/recorded-videos/${video.id}`} target="_blank">
                  <Button variant="ghost" size="sm">
                    Preview
                  </Button>
                </Link>
                <Button variant="outline" size="sm" onClick={() => openEdit(video)}>
                  <Pencil className="size-3.5 mr-1" /> Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(video)}
                  disabled={deletingId === video.id}
                >
                  {deletingId === video.id ? (
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
