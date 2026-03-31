import { auth } from '@/server/auth'
import { redirect } from 'next/navigation'
import { AnalyticsView } from '@/features/subjects/components/AnalyticsView'

interface Props {
  params: Promise<{ subjectId: string }>
}

export default async function AnalyticsPage({ params }: Props) {
  const session = await auth()
  if (
    !session ||
    (session.user.portalType !== 'ADMIN' &&
      session.user.portalType !== 'TEACHER')
  ) {
    redirect('/auth/login')
  }

  const { subjectId } = await params

  return <AnalyticsView subjectId={subjectId} />
}
