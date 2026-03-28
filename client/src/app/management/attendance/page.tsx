import { auth } from '@/server/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { AttendanceClient } from
  '@/features/attendance/components/AttendanceClient'
import type { SectionOption } from '@/features/attendance/types'
import type { AttendanceMode } from '@/features/attendance/types'

export default async function AttendancePage() {
  const session = await auth()
  if (!session) redirect('/auth/login')

  const institutionId = session.user.institutionId
  const isTeacher = session.user.portalType === 'TEACHER'

  let sectionRows: {
    id: string
    name: string
    classYear: {
      id: string
      classTemplate: { name: string }
    }
  }[]

  if (isTeacher) {
    const teacherSubjects = await prisma.subjectTeacher.findMany({
      where: { teacherId: session.user.id },
      select: {
        subject: {
          select: {
            section: {
              select: {
                id: true,
                name: true,
                classYear: {
                  select: {
                    id: true,
                    classTemplate: { select: { name: true } },
                  },
                },
              },
            },
          },
        },
      },
    })

    const sectionMap = new Map<string, typeof sectionRows[number]>()
    for (const ts of teacherSubjects) {
      const sec = ts.subject.section
      if (sec && !sectionMap.has(sec.id)) {
        sectionMap.set(sec.id, sec)
      }
    }
    sectionRows = Array.from(sectionMap.values())
  } else {
    sectionRows = await prisma.section.findMany({
      where: { institutionId },
      select: {
        id: true,
        name: true,
        classYear: {
          select: {
            id: true,
            classTemplate: { select: { name: true } },
          },
        },
      },
      orderBy: { name: 'asc' },
    })
  }

  const sections: SectionOption[] = sectionRows.map((s) => ({
    id: s.id,
    name: s.name,
    classYearId: s.classYear.id,
    className: s.classYear.classTemplate.name,
  }))

  const settings = await prisma.attendanceSettings.findUnique({
    where: { institutionId },
  })

  const mode: AttendanceMode = settings?.mode ?? 'DAILY'

  return (
    <AttendanceClient
      sections={sections}
      mode={mode}
    />
  )
}
