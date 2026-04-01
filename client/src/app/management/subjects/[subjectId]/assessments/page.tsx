import { auth } from '@/server/auth'
import { redirect, notFound } from 'next/navigation'
import { resolveSubjectId } from '@/lib/resolve-id'
import { AssessmentsView } from
  '@/features/subjects/components/AssessmentsView'

interface Props {
  params: Promise<{ subjectId: string }>
}

export default async function AssessmentsPage({ params }: Props) {
  const session = await auth()
  if (!session) redirect('/auth/login')

  const { subjectId: rawId } = await params
  const subjectId = await resolveSubjectId(rawId, session.user.institutionId)
  if (!subjectId) notFound()

  return <AssessmentsView subjectId={subjectId} />
}
