import { StudentSubjectClient } from '@/features/student/components/StudentSubjectClient'

interface PageProps {
  params: Promise<{ subjectId: string }>
}

export default async function StudentSubjectPage({ params }: PageProps) {
  const { subjectId } = await params
  return <StudentSubjectClient subjectId={subjectId} />
}
