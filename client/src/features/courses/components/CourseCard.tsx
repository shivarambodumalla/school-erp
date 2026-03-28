'use client'

import Link from 'next/link'
import { BookOpen, Users, FileText, ArrowRight } from 'lucide-react'

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-700',
  ARCHIVED: 'bg-gray-100 text-gray-600',
  DRAFT: 'bg-amber-100 text-amber-700',
}

interface CourseCardProps {
  course: {
    id: string
    title: string
    description: string | null
    status: string
    _count: { enrollments: number; posts: number }
  }
}

export function CourseCard({ course }: CourseCardProps) {
  const statusClass = STATUS_STYLES[course.status] ?? STATUS_STYLES.DRAFT

  return (
    <div className="rounded-xl border bg-card p-5 space-y-4
      hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="h-11 w-11 rounded-lg bg-primary/10 text-primary
          flex items-center justify-center shrink-0">
          <BookOpen className="h-5 w-5" />
        </div>
        <span className={`inline-flex items-center px-2 py-0.5
          rounded-full text-xs font-medium ${statusClass}`}>
          {course.status}
        </span>
      </div>

      <p className="font-bold text-lg leading-tight line-clamp-2">
        {course.title}
      </p>

      {course.description && (
        <p className="text-sm text-muted-foreground line-clamp-2">
          {course.description}
        </p>
      )}

      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span className="flex items-center gap-1">
          <Users className="h-3.5 w-3.5" />
          {course._count.enrollments} enrolled
        </span>
        <span className="flex items-center gap-1">
          <FileText className="h-3.5 w-3.5" />
          {course._count.posts} posts
        </span>
      </div>

      <Link
        href={`/management/courses/${course.id}`}
        className="inline-flex items-center gap-1 text-sm font-medium
          text-primary hover:underline min-h-[44px]"
      >
        Manage <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  )
}
