import { auth } from '@/server/auth'
import { prisma } from '@/lib/prisma'
import { redirect, notFound } from 'next/navigation'
import { resolveSubjectId } from '@/lib/resolve-id'
import { SubjectContentsView } from '@/features/subjects/components/SubjectContentsView'

interface Props {
  params: Promise<{ subjectId: string }>
}

export default async function SubjectPage({ params }: Props) {
  const session = await auth()
  if (!session) redirect('/auth/login')

  const { subjectId: rawId } = await params
  const subjectId = await resolveSubjectId(rawId, session.user.institutionId)
  if (!subjectId) notFound()

  return (
    <SubjectContentsView
      subjectId={subjectId}
      portalType={session.user.portalType}
    />
  )
}
