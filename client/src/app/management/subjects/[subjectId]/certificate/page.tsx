import { auth } from '@/server/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { CertificateViewer } from '@/features/subjects/components/CertificateViewer'

interface Props {
  params: Promise<{ subjectId: string }>
}

export default async function CertificatePage({
  params,
}: Props) {
  const session = await auth()
  if (!session) {
    redirect('/auth/login')
  }

  const institutionId = session.user.institutionId
  const { subjectId } = await params

  // Fetch the subject details
  const subject = await prisma.subject.findFirst({
    where: { id: subjectId, institutionId },
    select: {
      id: true,
      name: true,
      classYear: {
        include: {
          classTemplate: true,
          academicYear: true,
        },
      },
      section: { select: { name: true } },
      teachers: {
        where: { isPrimary: true },
        include: {
          user: { select: { email: true } },
          staff: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
        take: 1,
      },
    },
  })

  if (!subject) {
    redirect('/management/academic')
  }

  // Fetch institution details for the certificate
  const institution = await prisma.institution.findUnique({
    where: { id: institutionId },
    select: {
      name: true,
      logoUrl: true,
    },
  })

  // Attempt to fetch certificate data for the current user
  // Certificate auto-issues when progress reaches 100% (API handles this)
  let certificateData: {
    studentName: string
    completionDate: string
  } | null = null

  // For students, check if they have a certificate
  if (session.user.portalType === 'STUDENT') {
    try {
      const res = await fetch(
        `${process.env.NEXTAUTH_URL ?? ''}/api/school/subjects/${subjectId}/certificate`,
        {
          headers: {
            cookie: `next-auth.session-token=${session.user.id}`,
          },
        }
      )
      if (res.ok) {
        certificateData = (await res.json()) as {
          studentName: string
          completionDate: string
        }
      }
    } catch {
      // Certificate not available
    }
  }

  const primaryTeacher = subject.teachers[0]
  const teacherName = primaryTeacher?.staff
    ? `${primaryTeacher.staff.firstName} ${primaryTeacher.staff.lastName}`
    : primaryTeacher?.user.email.split('@')[0] ?? 'Teacher'

  return (
    <CertificateViewer
      subjectId={subject.id}
      subjectName={subject.name}
      className={subject.classYear.classTemplate.name}
      sectionName={subject.section?.name ?? null}
      academicYear={subject.classYear.academicYear.name}
      schoolName={institution?.name ?? 'School'}
      schoolLogo={institution?.logoUrl ?? null}
      teacherName={teacherName}
      studentName={certificateData?.studentName ?? null}
      completionDate={certificateData?.completionDate ?? null}
      isEarned={certificateData !== null}
    />
  )
}
