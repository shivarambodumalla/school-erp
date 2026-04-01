import { auth } from '@/server/auth'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { resolveClassYearId, resolveSubjectId } from '@/lib/resolve-id'
import { SubjectMiniLeftNav } from '@/features/classes/components/SubjectMiniLeftNav'
import { EnsureTabSync } from '@/features/classes/components/EnsureTabSync'
import type { ReactNode } from 'react'

interface Props {
  params: Promise<{ classYearId: string; subjectId: string }>
  children: ReactNode
}

export default async function SubjectDetailLayout({ params, children }: Props) {
  const session = await auth()
  if (!session) redirect('/auth/login')
  if (session.user.portalType !== 'ADMIN' && session.user.portalType !== 'TEACHER')
    redirect('/management/dashboard')

  const { classYearId: rawClassId, subjectId: rawSubjectId } = await params
  const institutionId = session.user.institutionId
  const classYearId = await resolveClassYearId(rawClassId, institutionId)
  if (!classYearId) notFound()
  const subjectId = await resolveSubjectId(rawSubjectId, institutionId)
  if (!subjectId) notFound()

  const subject = await prisma.subject.findFirst({
    where: { id: subjectId, institutionId, classYearId },
    include: {
      classYear: { select: { serialNo: true } },
      section: { select: { name: true } },
      teachers: {
        include: { user: { select: { email: true } } },
      },
    },
  })

  if (!subject) notFound()

  return (
    <>
      <EnsureTabSync
        classYearId={classYearId}
        type="subject"
        item={{ id: subject.id, serialNo: subject.serialNo, name: subject.name }}
      />
      <div className="flex min-h-[calc(100vh-6rem)]">
        <SubjectMiniLeftNav
          subjectId={subjectId}
          classSerialNo={subject.classYear.serialNo}
          subject={{
            name: subject.name,
            code: subject.code,
            color: subject.color,
            teachers: subject.teachers.map(t => ({
              email: t.user.email,
              isPrimary: t.isPrimary,
            })),
            section: subject.section?.name ?? null,
          }}
        />
        <div className="flex-1 min-w-0 p-4 md:p-6">
          {children}
        </div>
      </div>
    </>
  )
}
