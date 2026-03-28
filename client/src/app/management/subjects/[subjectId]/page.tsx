import { auth } from '@/server/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { SubjectPageClient } from '@/features/subjects/components/SubjectPageClient'
import type { SubjectDetail } from '@/features/subjects/types'

interface Props {
  params: Promise<{ subjectId: string }>
}

export default async function SubjectPage({ params }: Props) {
  const session = await auth()
  if (
    !session ||
    (session.user.portalType !== 'ADMIN' &&
      session.user.portalType !== 'TEACHER')
  ) {
    redirect('/auth/login')
  }

  const institutionId = session.user.institutionId
  const { subjectId } = await params

  const subject = await prisma.subject.findFirst({
    where: { id: subjectId, institutionId },
    include: {
      classYear: {
        include: {
          classTemplate: true,
          academicYear: true,
        },
      },
      section: true,
      teachers: {
        include: {
          user: { select: { id: true, email: true } },
        },
      },
      _count: {
        select: { posts: true, gradeEntries: true },
      },
    },
  })

  if (!subject) {
    redirect('/management/academic')
  }

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

  return <SubjectPageClient subject={data} />
}
