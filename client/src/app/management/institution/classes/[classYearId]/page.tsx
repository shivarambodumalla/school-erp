import { auth } from '@/server/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { ClassYearClient } from '@/features/classes/components/ClassYearClient'

interface Props {
  params: Promise<{ classYearId: string }>
}

export default async function ClassYearDetailPage({ params }: Props) {
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
      sections: {
        select: {
          id: true, name: true, maxStrength: true,
          classTeacherId: true,
          _count: { select: { students: true } },
        },
        orderBy: { name: 'asc' },
      },
      _count: { select: { sections: true, subjects: true } },
    },
  })

  if (!classYear) notFound()

  const serialized = {
    id: classYear.id,
    status: classYear.status,
    classTemplate: classYear.classTemplate,
    academicYear: classYear.academicYear,
    sections: classYear.sections.map((s) => ({
      id: s.id,
      name: s.name,
      maxStrength: s.maxStrength,
      classTeacherId: s.classTeacherId,
      _count: s._count,
    })),
    _count: classYear._count,
  }

  return <ClassYearClient classYear={serialized} />
}
