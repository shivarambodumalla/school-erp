import { auth } from '@/server/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { AcademicSettingsClient } from
  '@/features/settings/components/AcademicSettingsClient'

export default async function AcademicSettingsPage() {
  const session = await auth()
  if (!session || session.user.portalType !== 'ADMIN') {
    redirect('/auth/login')
  }

  const institutionId = session.user.institutionId

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
