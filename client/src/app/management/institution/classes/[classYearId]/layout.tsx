import { auth } from '@/server/auth'
import { prisma } from '@/lib/prisma'
import { redirect, notFound } from 'next/navigation'
import { ClassPageLeftPanel } from '@/features/classes/components/ClassPageLeftPanel'
import type { ReactNode } from 'react'

interface Props {
  params: Promise<{ classYearId: string }>
  children: ReactNode
}

export default async function ClassYearLayout({ params, children }: Props) {
  const session = await auth()
  if (!session) redirect('/auth/login')
  if (session.user.portalType !== 'ADMIN') redirect('/management/dashboard')

  const { classYearId } = await params
  const institutionId = session.user.institutionId

  const classYear = await prisma.classYear.findFirst({
    where: { id: classYearId, institutionId },
    include: {
      classTemplate: { select: { name: true, gradeLevel: true } },
      academicYear: { select: { name: true } },
      _count: { select: { sections: true, subjects: true, studentSections: true } },
    },
  })

  if (!classYear) notFound()

  const allClasses = await prisma.classYear.findMany({
    where: { institutionId, academicYear: { isCurrent: true } },
    select: {
      id: true,
      classTemplate: { select: { name: true, gradeLevel: true } },
      academicYear: { select: { name: true } },
    },
    orderBy: { classTemplate: { gradeLevel: 'asc' } },
  })

  const classYearData = {
    id: classYear.id,
    classTemplate: classYear.classTemplate,
    academicYear: classYear.academicYear,
    _count: classYear._count,
    status: classYear.status,
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Left panel - fixed width, sticky */}
      <ClassPageLeftPanel
        classYear={classYearData}
        allClasses={allClasses}
        classYearId={classYearId}
      />
      {/* Right panel - scrollable content */}
      <div className="flex-1 min-w-0 p-6">
        {children}
      </div>
    </div>
  )
}
