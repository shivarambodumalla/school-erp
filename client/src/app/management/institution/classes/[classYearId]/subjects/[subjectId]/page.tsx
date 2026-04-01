import { auth } from '@/server/auth'
import { redirect, notFound } from 'next/navigation'
import { resolveClassYearId } from '@/lib/resolve-id'
import { SubjectStream } from '@/features/subjects/components/SubjectStream'

interface Props {
  params: Promise<{ classYearId: string; subjectId: string }>
}

export default async function SubjectStreamPage({ params }: Props) {
  const session = await auth()
  if (!session) redirect('/auth/login')

  const { classYearId: rawId, subjectId } = await params
  const classYearId = await resolveClassYearId(rawId, session.user.institutionId)
  if (!classYearId) notFound()

  return <SubjectStream subjectId={subjectId} />
}
