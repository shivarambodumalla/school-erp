import { auth } from '@/server/auth'
import { prisma } from '@/lib/prisma'
import { redirect, notFound } from 'next/navigation'
import { CourseSettingsTab } from '@/features/courses/components/tabs/CourseSettingsTab'

interface Props {
  params: Promise<{ courseId: string }>
}

export default async function CourseSettingsPage({ params }: Props) {
  const session = await auth()
  if (!session) redirect('/auth/login')

  const portal = session.user.portalType
  if (portal !== 'ADMIN' && portal !== 'TEACHER') {
    redirect('/management/dashboard')
  }

  const { courseId } = await params
  const institutionId = session.user.institutionId

  const course = await prisma.course.findFirst({
    where: { id: courseId, institutionId },
    select: {
      id: true,
      title: true,
      description: true,
      status: true,
      targetType: true,
      maxEnrollment: true,
    },
  })

  if (!course) notFound()

  return <CourseSettingsTab course={course} />
}
