import { auth } from '@/server/auth'
import { redirect } from 'next/navigation'
import { GroupsView } from '@/features/subjects/components/GroupsView'

interface Props {
  params: Promise<{ subjectId: string }>
}

export default async function GroupsPage({ params }: Props) {
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

  return <GroupsView subjectId={subjectId} />
}
