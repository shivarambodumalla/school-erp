import { auth } from '@/server/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { SubjectSettingsView } from '@/features/subjects/components/SubjectSettingsView'

interface Props {
  params: Promise<{ subjectId: string }>
}

export default async function SubjectSettingsPage({ params }: Props) {
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
    select: {
      id: true,
      name: true,
      code: true,
      canPreviewFiles: true,
      canDownloadFiles: true,
      hasOnlineContent: true,
      weeklyPeriods: true,
      classYear: {
        include: {
          classTemplate: true,
          academicYear: true,
        },
      },
      section: { select: { id: true, name: true } },
      teachers: {
        include: {
          user: { select: { id: true, email: true } },
          staff: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      },
    },
  })

  if (!subject) {
    redirect('/management/academic')
  }

  return <SubjectSettingsView subjectId={subject.id} />
}
