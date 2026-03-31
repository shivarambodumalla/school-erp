import { auth } from '@/server/auth'
import { redirect } from 'next/navigation'
import { SubjectsListContent } from '@/features/classes/components/pages/SubjectsListContent'

interface Props {
  params: Promise<{ classYearId: string }>
}

export default async function ClassSubjectsPage({ params }: Props) {
  const session = await auth()
  if (!session) redirect('/auth/login')
  if (session.user.portalType !== 'ADMIN') redirect('/management/dashboard')

  const { classYearId } = await params

  return <SubjectsListContent classYearId={classYearId} />
}
