'use client'

import { useEffect, useState, useCallback } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { CourseContentTab } from './tabs/CourseContentTab'
import { CourseStudentsTab } from './tabs/CourseStudentsTab'
import { CourseSettingsTab } from './tabs/CourseSettingsTab'

interface CoursePost {
  id: string
  type: string
  title: string
  description: string | null
  topicTag: string | null
  isPublished: boolean
  order: number
}

interface CourseData {
  id: string
  title: string
  description: string | null
  status: string
  targetType: string
  maxEnrollment: number | null
  instructorId: string
  posts: CoursePost[]
  _count: { enrollments: number }
}

interface Props {
  courseId: string
}

export function CourseDetailClient({ courseId }: Props) {
  const [course, setCourse] = useState<CourseData | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(() => {
    fetch(`/api/school/courses/${courseId}`)
      .then((r) => r.json())
      .then((d: CourseData) => setCourse(d))
      .finally(() => setLoading(false))
  }, [courseId])

  useEffect(() => { load() }, [load])

  if (loading || !course) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full
          border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{course.title}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {course.status} | {course._count.enrollments} enrolled
        </p>
      </div>

      <Tabs defaultValue="content">
        <TabsList className="w-full">
          <TabsTrigger value="content" className="flex-1 min-h-[44px]">
            Content
          </TabsTrigger>
          <TabsTrigger value="students" className="flex-1 min-h-[44px]">
            Students
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex-1 min-h-[44px]">
            Settings
          </TabsTrigger>
        </TabsList>
        <TabsContent value="content">
          <CourseContentTab
            courseId={courseId}
            posts={course.posts}
            onRefresh={load}
          />
        </TabsContent>
        <TabsContent value="students">
          <CourseStudentsTab courseId={courseId} />
        </TabsContent>
        <TabsContent value="settings">
          <CourseSettingsTab course={course} onSaved={load} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
