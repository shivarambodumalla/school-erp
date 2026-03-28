import { CourseDetailClient } from '@/features/courses/components/CourseDetailClient'

interface PageProps {
  params: Promise<{ courseId: string }>
}

export default async function CourseDetailPage({ params }: PageProps) {
  const { courseId } = await params
  return <CourseDetailClient courseId={courseId} />
}
