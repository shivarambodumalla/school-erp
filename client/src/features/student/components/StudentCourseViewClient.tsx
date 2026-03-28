'use client'

import { useEffect, useState, useCallback } from 'react'
import { FileText, CheckCircle2, Circle } from 'lucide-react'

interface CoursePost {
  id: string
  type: string
  title: string
  description: string | null
  isPublished: boolean
  order: number
}

interface Enrollment {
  progressPercent: number
  completedPostIds: string[]
}

interface CourseData {
  id: string
  title: string
  description: string | null
  posts: CoursePost[]
  enrollment: Enrollment | null
}

interface Props {
  courseId: string
}

export function StudentCourseViewClient({ courseId }: Props) {
  const [course, setCourse] = useState<CourseData | null>(null)
  const [completed, setCompleted] = useState<string[]>([])
  const [progress, setProgress] = useState(0)
  const [loading, setLoading] = useState(true)

  const load = useCallback(() => {
    fetch(`/api/school/courses/${courseId}`)
      .then((r) => r.json())
      .then((d: CourseData) => {
        setCourse(d)
        const ids = (d.enrollment?.completedPostIds ?? []) as string[]
        setCompleted(ids)
        setProgress(d.enrollment?.progressPercent ?? 0)
      })
      .finally(() => setLoading(false))
  }, [courseId])

  useEffect(() => { load() }, [load])

  const toggleComplete = async (postId: string) => {
    const isCompleted = completed.includes(postId)
    const next = isCompleted
      ? completed.filter((id) => id !== postId)
      : [...completed, postId]
    setCompleted(next)

    const res = await fetch(`/api/school/courses/${courseId}/progress`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId, completed: !isCompleted }),
    })
    if (res.ok) {
      const data = (await res.json()) as { progressPercent: number }
      setProgress(data.progressPercent)
    }
  }

  if (loading || !course) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full
          border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  const publishedPosts = course.posts.filter((p) => p.isPublished)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{course.title}</h1>
        {course.description && (
          <p className="text-sm text-muted-foreground mt-1">
            {course.description}
          </p>
        )}
      </div>

      {/* Progress ring */}
      <div className="flex items-center gap-4">
        <div className="relative h-16 w-16">
          <svg className="h-16 w-16 -rotate-90" viewBox="0 0 36 36">
            <path
              className="text-muted"
              stroke="currentColor"
              strokeWidth="3"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className="text-primary"
              stroke="currentColor"
              strokeWidth="3"
              strokeDasharray={`${progress}, 100`}
              strokeLinecap="round"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <span className="absolute inset-0 flex items-center
            justify-center text-xs font-bold">
            {progress}%
          </span>
        </div>
        <div>
          <p className="font-medium">
            {completed.length}/{publishedPosts.length} completed
          </p>
          <p className="text-xs text-muted-foreground">
            Keep going!
          </p>
        </div>
      </div>

      {/* Post list */}
      <div className="space-y-2">
        {publishedPosts.map((post) => {
          const done = completed.includes(post.id)
          return (
            <button
              key={post.id}
              onClick={() => toggleComplete(post.id)}
              className="flex items-center gap-3 rounded-lg border
                bg-card px-4 py-3 w-full text-left min-h-[44px]
                hover:bg-muted/50 transition-colors"
            >
              {done ? (
                <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${
                  done ? 'line-through text-muted-foreground' : ''
                }`}>
                  {post.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {post.type}
                </p>
              </div>
              <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
            </button>
          )
        })}
      </div>
    </div>
  )
}
