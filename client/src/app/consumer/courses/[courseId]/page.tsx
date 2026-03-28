import { StudentCourseViewClient } from '@/features/student/components/StudentCourseViewClient'

interface PageProps {
  params: Promise<{ courseId: string }>
}

export default async function CourseViewPage({ params }: PageProps) {
  const { courseId } = await params
  return <StudentCourseViewClient courseId={courseId} />
}
