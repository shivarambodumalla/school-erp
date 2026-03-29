import { prisma } from '@/lib/prisma'
import { AcademicSettingsClient } from
  '@/features/settings/components/AcademicSettingsClient'

export default async function SuperManageAcademicSettings({
  params,
}: {
  params: { institutionId: string }
}) {
  const institutionId = params.institutionId

  const examTypes = await prisma.examType.findMany({
    where: { institutionId },
    orderBy: { order: 'asc' },
  })

  const attendanceSettings = await prisma.attendanceSettings.findUnique({
    where: { institutionId },
  })

  return (
    <AcademicSettingsClient
      examTypes={examTypes.map((et) => ({
        id: et.id,
        name: et.name,
        shortName: et.shortName,
        countInFinalGrade: et.countInFinalGrade,
        weightage: et.weightage,
        order: et.order,
      }))}
      attendanceMode={attendanceSettings?.mode ?? 'DAILY'}
    />
  )
}
