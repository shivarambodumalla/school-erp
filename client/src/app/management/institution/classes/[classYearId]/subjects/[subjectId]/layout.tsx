import { auth } from '@/server/auth'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { resolveClassYearId } from '@/lib/resolve-id'
import { ClassTabBar } from '@/features/classes/components/ClassTabBar'
import { SubjectHeader } from '@/features/classes/components/pages/SubjectHeader'
import { SubjectSubTabBar } from '@/features/classes/components/SubjectSubTabBar'
import { EnsureTabSync } from '@/features/classes/components/EnsureTabSync'
import type { SubjectDetail } from '@/features/subjects/types'
import type { ReactNode } from 'react'

interface Props {
  params: Promise<{ classYearId: string; subjectId: string }>
  children: ReactNode
}

export default async function SubjectDetailLayout({ params, children }: Props) {
  const session = await auth()
  if (!session) redirect('/auth/login')
  const portal = session.user.portalType
  if (portal !== 'ADMIN' && portal !== 'TEACHER') redirect('/management/dashboard')

  const { classYearId: rawId, subjectId } = await params
  const institutionId = session.user.institutionId
  const classYearId = await resolveClassYearId(rawId, institutionId)
  if (!classYearId) notFound()

  const subject = await prisma.subject.findFirst({
    where: { id: subjectId, institutionId, classYearId },
    include: {
      classYear: {
        include: { classTemplate: true, academicYear: true },
      },
      section: true,
      teachers: {
        include: { user: { select: { id: true, email: true } } },
      },
      _count: { select: { posts: true, gradeEntries: true } },
    },
  })

  if (!subject) notFound()

  const data: SubjectDetail = {
    id: subject.id,
    name: subject.name,
    code: subject.code,
    weeklyPeriods: subject.weeklyPeriods,
    hasOnlineContent: subject.hasOnlineContent,
    canPreviewFiles: subject.canPreviewFiles,
    canDownloadFiles: subject.canDownloadFiles,
    classYear: {
      id: subject.classYear.id,
      classTemplate: {
        id: subject.classYear.classTemplate.id,
        name: subject.classYear.classTemplate.name,
      },
      academicYear: {
        id: subject.classYear.academicYear.id,
        name: subject.classYear.academicYear.name,
      },
    },
    section: subject.section
      ? { id: subject.section.id, name: subject.section.name }
      : null,
    teachers: subject.teachers.map((t) => ({
      id: t.id,
      isPrimary: t.isPrimary,
      user: { id: t.user.id, email: t.user.email },
    })),
    _count: subject._count,
  }

  return (
    <div className="space-y-0">
      <EnsureTabSync
        classYearId={classYearId}
        type="subject"
        item={{ id: data.id, name: data.name }}
      />
      <ClassTabBar classYearId={classYearId} type="subject" activeId={subjectId} />
      <SubjectHeader subject={data} classYearId={classYearId} />
      <SubjectSubTabBar classYearId={classYearId} subjectId={subjectId} />
      <div className="pt-4">{children}</div>
    </div>
  )
}
