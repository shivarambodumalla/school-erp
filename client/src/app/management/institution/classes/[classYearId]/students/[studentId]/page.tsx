import { StudentDetailInline } from '@/features/students/components/StudentDetailInline'

interface Props {
  params: Promise<{ classYearId: string; studentId: string }>
}

export default async function StudentOverviewPage({ params }: Props) {
  const { studentId } = await params

  return <StudentDetailInline studentId={studentId} />
}
