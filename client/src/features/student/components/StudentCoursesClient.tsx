'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { BookOpen, Users, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CourseItem {
  id: string
  title: string
  description: string | null
  status: string
  _count: { enrollments: number; posts: number }
  enrollment: {
    progressPercent: number
    completedAt: string | null
  } | null
}

export function StudentCoursesClient() {
  const [courses, setCourses] = useState<CourseItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/school/courses?status=ACTIVE')
      .then((r) => r.json())
      .then((d: { courses: CourseItem[] }) => setCourses(d.courses))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full
          border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  const enrolled = courses.filter((c) => c.enrollment)
  const browse = courses.filter((c) => !c.enrollment)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Courses</h1>

      {enrolled.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground
            uppercase tracking-wider">
            My Courses
          </h2>
          {enrolled.map((c) => (
            <Link
              key={c.id}
              href={`/consumer/courses/${c.id}`}
              className="flex items-center gap-3 rounded-xl border
                bg-card p-4 hover:shadow-md transition-shadow block"
            >
              <div className="h-11 w-11 rounded-lg bg-primary/10
                text-primary flex items-center justify-center shrink-0">
                <BookOpen className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{c.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="h-2 w-20 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{
                        width: `${c.enrollment?.progressPercent ?? 0}%`,
                      }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {c.enrollment?.progressPercent ?? 0}%
                  </span>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          ))}
        </div>
      )}

      {browse.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground
            uppercase tracking-wider">
            Browse Courses
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {browse.map((c) => (
              <div
                key={c.id}
                className="rounded-xl border bg-card p-4 space-y-3"
              >
                <p className="font-semibold">{c.title}</p>
                {c.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {c.description}
                  </p>
                )}
                <div className="flex items-center gap-2 text-xs
                  text-muted-foreground">
                  <Users className="h-3.5 w-3.5" />
                  {c._count.enrollments} enrolled
                </div>
                <EnrollButton courseId={c.id} />
              </div>
            ))}
          </div>
        </div>
      )}

      {courses.length === 0 && (
        <p className="text-muted-foreground text-center py-12">
          No courses available.
        </p>
      )}
    </div>
  )
}

function EnrollButton({ courseId }: { courseId: string }) {
  const [enrolling, setEnrolling] = useState(false)
  const [done, setDone] = useState(false)

  const handleEnroll = async () => {
    setEnrolling(true)
    const res = await fetch(`/api/school/courses/${courseId}/enroll`, {
      method: 'POST',
    })
    if (res.ok) setDone(true)
    setEnrolling(false)
  }

  if (done) {
    return (
      <Link href={`/consumer/courses/${courseId}`}>
        <Button size="sm" variant="outline" className="min-h-[44px]">
          View Course
        </Button>
      </Link>
    )
  }

  return (
    <Button
      size="sm"
      onClick={handleEnroll}
      disabled={enrolling}
      className="min-h-[44px]"
    >
      {enrolling ? 'Enrolling...' : 'Enroll'}
    </Button>
  )
}
