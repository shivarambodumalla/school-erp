import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { SubjectPageClient } from
  '@/features/subjects/components/SubjectPageClient'
import type { SubjectDetail } from '@/features/subjects/types'

export default async function SuperManageSubject({
  params,
}: {
  params: { institutionId: string; subjectId: string }
}) {
  const subject = await prisma.subject.findFirst({
    where: { id: params.subjectId, institutionId: params.institutionId },
    include: {
      classYear: {
        include: {
          classTemplate: { select: { id: true, name: true } },
          academicYear: { select: { id: true, name: true } },
        },
      },
      section: { select: { id: true, name: true } },
      teachers: {
        include: { user: { select: { id: true, email: true } } },
      },
      _count: { select: { posts: true, gradeEntries: true } },
    },
  })

  if (!subject) notFound()

  const detail: SubjectDetail = {
    id: subject.id,
    name: subject.name,
    code: subject.code,
    weeklyPeriods: subject.weeklyPeriods,
    hasOnlineContent: subject.hasOnlineContent,
    canPreviewFiles: subject.canPreviewFiles,
    canDownloadFiles: subject.canDownloadFiles,
    classYear: {
      id: subject.classYear.id,
      classTemplate: subject.classYear.classTemplate,
      academicYear: subject.classYear.academicYear,
    },
    section: subject.section,
    teachers: subject.teachers.map((t) => ({
      id: t.id,
      isPrimary: t.isPrimary,
      user: t.user,
    })),
    _count: subject._count,
  }

  return <SubjectPageClient subject={detail} />
}
