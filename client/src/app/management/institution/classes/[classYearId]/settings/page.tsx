import { auth } from '@/server/auth'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { resolveClassYearId } from '@/lib/resolve-id'
import { ClassSettingsView } from '@/features/classes/components/ClassSettingsView'

interface Props {
  params: Promise<{ classYearId: string }>
}

export default async function ClassSettingsPage({ params }: Props) {
  const session = await auth()
  if (!session) redirect('/auth/login')
  if (session.user.portalType !== 'ADMIN') redirect('/management/dashboard')

  const { classYearId: rawId } = await params
  const institutionId = session.user.institutionId
  const classYearId = await resolveClassYearId(rawId, institutionId)
  if (!classYearId) notFound()

  const classYear = await prisma.classYear.findFirst({
    where: { id: classYearId, institutionId },
    select: {
      id: true,
      classTemplate: { select: { name: true, gradeLevel: true } },
      academicYear: { select: { name: true } },
    },
  })

  if (!classYear) notFound()

  return (
    <div className="px-4 md:px-6 py-4">
      <ClassSettingsView
        classYearId={classYearId}
        className={classYear.classTemplate.name}
        gradeLevel={classYear.classTemplate.gradeLevel}
        academicYearName={classYear.academicYear.name}
      />
    </div>
  )
}
