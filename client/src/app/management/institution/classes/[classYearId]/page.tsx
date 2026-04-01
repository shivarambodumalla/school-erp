import { auth } from '@/server/auth'
import { prisma } from '@/lib/prisma'
import { redirect, notFound } from 'next/navigation'
import { resolveClassYearId } from '@/lib/resolve-id'
import { ClassPageHeader } from '@/features/classes/components/ClassPageHeader'
import { SectionsTab } from '@/features/classes/components/tabs/SectionsTab'

interface Props {
  params: Promise<{ classYearId: string }>
}

export default async function ClassOverviewPage({ params }: Props) {
  const session = await auth()
  if (!session) redirect('/auth/login')
  if (session.user.portalType !== 'ADMIN') redirect('/management/dashboard')

  const { classYearId: rawId } = await params
  const institutionId = session.user.institutionId
  const classYearId = await resolveClassYearId(rawId, institutionId)
  if (!classYearId) notFound()

  const classYear = await prisma.classYear.findFirst({
    where: { id: classYearId, institutionId },
    include: {
      classTemplate: { select: { name: true, gradeLevel: true } },
      academicYear: { select: { id: true, name: true, isCurrent: true } },
      _count: { select: { sections: true, subjects: true, studentSections: true } },
    },
  })

  if (!classYear) notFound()

  const allYears = await prisma.classYear.findMany({
    where: { institutionId, classTemplateId: classYear.classTemplateId },
    select: {
      id: true,
      serialNo: true,
      status: true,
      academicYear: { select: { id: true, name: true, isCurrent: true } },
    },
    orderBy: { academicYear: { startDate: 'desc' } },
  })

  const academicYears = allYears.map(y => ({
    classYearId: y.id,
    serialNo: y.serialNo,
    academicYearName: y.academicYear.name,
    isCurrent: y.academicYear.isCurrent,
    status: y.status,
  }))

  return (
    <div className="px-4 md:px-6 py-4 space-y-6">
      <ClassPageHeader
        classData={{
          id: classYear.id,
          serialNo: classYear.serialNo,
          classTemplate: classYear.classTemplate,
          academicYear: classYear.academicYear,
          status: classYear.status,
          _count: classYear._count,
        }}
        academicYears={academicYears}
      />
      <SectionsTab classYearId={classYearId} />
    </div>
  )
}
