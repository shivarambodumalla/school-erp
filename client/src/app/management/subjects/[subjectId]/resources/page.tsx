import { auth } from '@/server/auth'
import { redirect } from 'next/navigation'
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

  const { subjectId } = await params

  return <ResourcesView subjectId={subjectId} />
}
