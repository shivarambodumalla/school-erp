import { auth } from '@/server/auth'
import { redirect, notFound } from 'next/navigation'
import { resolveClassYearId } from '@/lib/resolve-id'
import { ClassGradebookClient } from
  '@/features/gradebook/components/ClassGradebookClient'

interface Props {
  params: Promise<{ classYearId: string }>
}

export default async function ClassGradebookPage({ params }: Props) {
  const session = await auth()
  if (!session) redirect('/auth/login')

  const { classYearId: rawId } = await params
  const classYearId = await resolveClassYearId(rawId, session.user.institutionId)
  if (!classYearId) notFound()

  return <ClassGradebookClient classYearId={classYearId} />
}
