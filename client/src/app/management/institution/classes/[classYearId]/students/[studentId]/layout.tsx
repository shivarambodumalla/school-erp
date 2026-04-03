import { auth } from '@/server/auth'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { resolveClassYearId } from '@/lib/resolve-id'
import { EnsureTabSync } from '@/features/classes/components/EnsureTabSync'
import type { ReactNode } from 'react'

interface Props {
  params: Promise<{ classYearId: string; studentId: string }>
  children: ReactNode
}

export default async function StudentDetailLayout({ params, children }: Props) {
  const session = await auth()
  if (!session) redirect('/auth/login')
  if (session.user.portalType !== 'ADMIN' && session.user.portalType !== 'TEACHER')
    redirect('/management/dashboard')

  const { classYearId: rawId, studentId } = await params
  const classYearId = await resolveClassYearId(rawId, session.user.institutionId)
  if (!classYearId) notFound()

  const studentSection = await prisma.studentSection.findFirst({
    where: { student: { id: studentId } },
    select: { student: { select: { firstName: true, lastName: true } } },
  })

  const studentName = studentSection
    ? `${studentSection.student.firstName} ${studentSection.student.lastName}`
    : 'Student'

  return (
    <>
      <EnsureTabSync
        classYearId={classYearId}
        type="student"
        item={{ id: studentId, name: studentName }}
      />
      {children}
    </>
  )
}
