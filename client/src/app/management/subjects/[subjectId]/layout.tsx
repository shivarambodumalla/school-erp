import { auth } from '@/server/auth'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { SubjectLeftNav } from '@/features/subjects/components/SubjectLeftNav'
import type { ReactNode } from 'react'

interface Props {
  params: Promise<{ subjectId: string }>
  children: ReactNode
}

export default async function SubjectLmsLayout({ params, children }: Props) {
  const session = await auth()
  if (!session) redirect('/auth/login')

  const portal = session.user.portalType
  if (portal !== 'ADMIN' && portal !== 'TEACHER' && portal !== 'STUDENT') {
    redirect('/management/dashboard')
  }

  const { subjectId: rawSubjectId } = await params
  const institutionId = session.user.institutionId

  // Resolve serialNo to CUID if numeric
  const isNumeric = /^\d+$/.test(rawSubjectId)
  const subjectId = isNumeric
    ? await (async () => {
        const s = await prisma.subject.findFirst({
          where: { serialNo: parseInt(rawSubjectId, 10), institutionId },
          select: { id: true },
        })
        return s?.id ?? rawSubjectId
      })()
    : rawSubjectId

  const subject = await prisma.subject.findFirst({
    where: { id: subjectId, institutionId },
    include: {
      classYear: {
        include: { classTemplate: true },
      },
      section: true,
      teachers: {
        include: {
          user: { select: { id: true, email: true } },
        },
      },
      _count: {
        select: {
          modules: true,
          announcements: true,
        },
      },
    },
  })

  if (!subject) notFound()

  const subjectInfo = {
    id: subject.id,
    name: subject.name,
    code: subject.code,
    color: subject.color,
    classYear: subject.classYear.classTemplate.name,
    section: subject.section?.name ?? null,
    teachers: subject.teachers.map((t) => ({
      email: t.user.email,
      isPrimary: t.isPrimary,
    })),
    moduleCount: subject._count.modules,
    announcementCount: subject._count.announcements,
  }

  return (
    <div className="flex flex-col lg:flex-row gap-0 min-h-[calc(100vh-4rem)]">
      <SubjectLeftNav
        subject={subjectInfo}
        portalType={portal}
      />
      <main className="flex-1 p-4 sm:p-6 overflow-auto">
        {children}
      </main>
    </div>
  )
}
