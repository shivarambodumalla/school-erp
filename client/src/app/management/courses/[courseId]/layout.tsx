import { auth } from '@/server/auth'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { CourseLeftNav } from '@/features/courses/components/CourseLeftNav'
import type { ReactNode } from 'react'

interface Props {
  params: Promise<{ courseId: string }>
  children: ReactNode
}

export default async function CourseLmsLayout({ params, children }: Props) {
  const session = await auth()
  if (!session) redirect('/auth/login')

  const portal = session.user.portalType
  if (portal !== 'ADMIN' && portal !== 'TEACHER' && portal !== 'STUDENT') {
    redirect('/management/dashboard')
  }

  const { courseId } = await params
  const institutionId = session.user.institutionId

  const course = await prisma.course.findFirst({
    where: { id: courseId, institutionId },
    include: {
      _count: {
        select: {
          enrollments: true,
          posts: true,
        },
      },
    },
  })

  if (!course) notFound()

  const courseInfo = {
    id: course.id,
    title: course.title,
    description: course.description,
    status: course.status,
    enrollmentCount: course._count.enrollments,
    postCount: course._count.posts,
  }

  return (
    <div className="flex flex-col lg:flex-row gap-0 min-h-[calc(100vh-4rem)]">
      <CourseLeftNav course={courseInfo} />
      <main className="flex-1 p-4 sm:p-6 overflow-auto">
        {children}
      </main>
    </div>
  )
}
