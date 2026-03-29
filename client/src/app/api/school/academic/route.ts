import { NextResponse } from 'next/server'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  const ctx = await getSchoolContext(req, ['ADMIN'])
    if (isApiError(ctx)) return ctx
    const { institutionId } = ctx

  try {
    // Separate query to preserve Prisma's inferred type with sections
    const classYears = await prisma.classYear.findMany({
      where: { institutionId },
      include: {
        classTemplate: { select: { name: true, gradeLevel: true } },
        sections: { select: { id: true } },
      },
      orderBy: { classTemplate: { gradeLevel: 'asc' } },
    })

    const [studentCount, academicYear, academicYears] = await Promise.all([
      prisma.student.count({ where: { institutionId } }),
      prisma.academicYear.findFirst({
        where: { institutionId, isCurrent: true },
        select: { id: true },
      }),
      prisma.academicYear.findMany({
        where: { institutionId },
        select: { id: true, name: true, isCurrent: true },
        orderBy: { startDate: 'desc' },
      }),
    ])

    return NextResponse.json({
      classCount: classYears.length,
      sectionCount: classYears.reduce((sum: number, c: typeof classYears[number]) => sum + c.sections.length, 0),
      studentCount,
      hasAcademicYear: !!academicYear,
      academicYears,
      classes: classYears.map((c: typeof classYears[number]) => ({
        id: c.id, name: c.classTemplate.name,
        gradeLevel: c.classTemplate.gradeLevel,
        sectionCount: c.sections.length,
      })),
    })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
