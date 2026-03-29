import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { ClassYearClient } from
  '@/features/classes/components/ClassYearClient'

export default async function SuperManageClassDetail({
  params,
}: {
  params: { institutionId: string; classYearId: string }
}) {
  const classYear = await prisma.classYear.findFirst({
    where: {
      id: params.classYearId,
      institutionId: params.institutionId,
    },
    include: {
      classTemplate: { select: { name: true, gradeLevel: true } },
      academicYear: { select: { name: true } },
      sections: {
        select: {
          id: true,
          name: true,
          maxStrength: true,
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
