import { auth } from '@/server/auth'
import { redirect, notFound } from 'next/navigation'
import { resolveClassYearId } from '@/lib/resolve-id'
import { StudentDetailInline } from '@/features/students/components/StudentDetailInline'

interface Props {
  params: Promise<{ classYearId: string; studentId: string }>
}

export default async function StudentOverviewPage({ params }: Props) {
  const session = await auth()
  if (!session) redirect('/auth/login')

  const { classYearId: rawId, studentId } = await params
  const classYearId = await resolveClassYearId(rawId, session.user.institutionId)
  if (!classYearId) notFound()

  return <StudentDetailInline studentId={studentId} />
}
