import { auth } from '@/server/auth'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { resolveClassYearId } from '@/lib/resolve-id'
import { SubjectInClassTabBar } from '@/features/classes/components/SubjectInClassTabBar'
import type { ReactNode } from 'react'

interface Props {
  params: Promise<{ classYearId: string }>
  children: ReactNode
}

export default async function SubjectsLayout({ params, children }: Props) {
  const session = await auth()
  if (!session) redirect('/auth/login')

  const { classYearId: rawId } = await params
  const classYearId = await resolveClassYearId(rawId, session.user.institutionId)
  if (!classYearId) notFound()

  const classYear = await prisma.classYear.findFirst({
    where: { id: classYearId },
    select: { serialNo: true },
  })
  if (!classYear) notFound()

  return (
    <>
      <SubjectInClassTabBar classSerialNo={classYear.serialNo} classYearId={classYearId} />
      <div className="px-4 md:px-6 py-4">
        {children}
      </div>
    </>
  )
}
