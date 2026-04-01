import { auth } from '@/server/auth'
import { redirect, notFound } from 'next/navigation'
import { resolveSubjectId } from '@/lib/resolve-id'
import { ResourcesView } from '@/features/subjects/components/ResourcesView'

interface Props {
  params: Promise<{ subjectId: string }>
}

export default async function ResourcesPage({ params }: Props) {
  const session = await auth()
  if (
    !session ||
    (session.user.portalType !== 'ADMIN' &&
      session.user.portalType !== 'TEACHER' &&
      session.user.portalType !== 'STUDENT')
  ) {
    redirect('/auth/login')
  }

  const { subjectId: rawId } = await params
  const subjectId = await resolveSubjectId(rawId, session.user.institutionId)
  if (!subjectId) notFound()

  return <ResourcesView subjectId={subjectId} />
}
