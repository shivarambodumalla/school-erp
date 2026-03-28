'use client'

import { useEffect, useState } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { StudentStream } from './StudentStream'
import { StudentClasswork } from './StudentClasswork'
import type { StreamPost } from './types'

interface StudentSubjectClientProps {
  subjectId: string
}

export function StudentSubjectClient({ subjectId }: StudentSubjectClientProps) {
  const [posts, setPosts] = useState<StreamPost[]>([])
  const [studentId, setStudentId] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/student/subjects/${subjectId}/stream`)
      .then((r) => r.json())
      .then((d: { posts: StreamPost[]; studentId: string }) => {
        setPosts(d.posts)
        setStudentId(d.studentId)
      })
      .finally(() => setLoading(false))
  }, [subjectId])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full
          border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Tabs defaultValue="stream">
        <TabsList className="w-full">
          <TabsTrigger value="stream" className="flex-1 min-h-[44px]">
            Stream
          </TabsTrigger>
          <TabsTrigger value="classwork" className="flex-1 min-h-[44px]">
            Classwork
          </TabsTrigger>
        </TabsList>
        <TabsContent value="stream">
          <StudentStream
            posts={posts}
            subjectId={subjectId}
            studentId={studentId}
          />
        </TabsContent>
        <TabsContent value="classwork">
          <StudentClasswork posts={posts} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
