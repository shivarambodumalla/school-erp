import { auth } from '@/server/auth'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { resolveClassYearId } from '@/lib/resolve-id'
import { StudentsListContent } from '@/features/classes/components/pages/StudentsListContent'

interface Props {
  params: Promise<{ classYearId: string }>
}

export default async function ClassStudentsPage({ params }: Props) {
  const session = await auth()
  if (!session) redirect('/auth/login')
  if (session.user.portalType !== 'ADMIN') redirect('/management/dashboard')

  const { classYearId: rawId } = await params
  const institutionId = session.user.institutionId
  const classYearId = await resolveClassYearId(rawId, institutionId)
  if (!classYearId) notFound()

  const sections = await prisma.section.findMany({
    where: { classYearId, institutionId },
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  })

  return (
    <StudentsListContent
      classYearId={classYearId}
      sections={sections}
    />
  )
}
