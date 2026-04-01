import { auth } from '@/server/auth'
import { redirect, notFound } from 'next/navigation'
import { resolveClassYearId } from '@/lib/resolve-id'
import { SubjectClasswork } from '@/features/subjects/components/SubjectClasswork'

interface Props {
  params: Promise<{ classYearId: string; subjectId: string }>
}

export default async function SubjectClassworkPage({ params }: Props) {
  const session = await auth()
  if (!session) redirect('/auth/login')

  const { classYearId: rawId, subjectId } = await params
  const classYearId = await resolveClassYearId(rawId, session.user.institutionId)
  if (!classYearId) notFound()

  return <SubjectClasswork subjectId={subjectId} />
}
