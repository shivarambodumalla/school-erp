import { auth } from '@/server/auth'
import { prisma } from '@/lib/prisma'
import { redirect, notFound } from 'next/navigation'
import { CourseContentTab } from '@/features/courses/components/tabs/CourseContentTab'

interface Props {
  params: Promise<{ courseId: string }>
}

export default async function CourseContentPage({ params }: Props) {
  const session = await auth()
  if (!session) redirect('/auth/login')

  const { courseId } = await params
  const institutionId = session.user.institutionId

  const course = await prisma.course.findFirst({
    where: { id: courseId, institutionId },
    include: {
      posts: {
        include: { attachments: true },
        orderBy: { order: 'asc' },
      },
    },
  })

  if (!course) notFound()

  return (
    <CourseContentTab
      courseId={courseId}
      initialPosts={course.posts.map(p => ({
        id: p.id,
        type: p.type,
        title: p.title,
        description: p.description,
        topicTag: p.topicTag,
        isPublished: p.isPublished,
        order: p.order,
      }))}
    />
  )
}
