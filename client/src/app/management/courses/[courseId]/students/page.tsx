import { auth } from '@/server/auth'
import { redirect } from 'next/navigation'
import { CourseStudentsTab } from '@/features/courses/components/tabs/CourseStudentsTab'

interface Props {
  params: Promise<{ courseId: string }>
}

export default async function CourseStudentsPage({ params }: Props) {
  const session = await auth()
  if (!session) redirect('/auth/login')

  const { courseId } = await params
  return <CourseStudentsTab courseId={courseId} />
}
