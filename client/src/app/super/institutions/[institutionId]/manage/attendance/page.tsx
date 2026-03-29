import { prisma } from '@/lib/prisma'
import { AttendanceClient } from
  '@/features/attendance/components/AttendanceClient'
import type { SectionOption, AttendanceMode } from
  '@/features/attendance/types'

export default async function SuperManageAttendance({
  params,
}: {
  params: { institutionId: string }
}) {
  const institutionId = params.institutionId

  const sectionRows = await prisma.section.findMany({
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

  return <AttendanceClient sections={sections} mode={mode} />
}
