import { auth } from '@/server/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { SubjectContentsView } from '@/features/subjects/components/SubjectContentsView'

interface Props {
  params: Promise<{ subjectId: string }>
}

export default async function SubjectPage({ params }: Props) {
  const session = await auth()
  if (!session) {
    redirect('/auth/login')
  }

  const institutionId = session.user.institutionId
  const { subjectId } = await params

  const subject = await prisma.subject.findFirst({
    where: { id: subjectId, institutionId },
    select: { id: true },
  })

  if (!subject) {
    redirect('/management/academic')
  }

  return (
    <SubjectContentsView
      subjectId={subject.id}
      portalType={session.user.portalType}
    />
  )
}
