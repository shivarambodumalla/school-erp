import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/server/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: { institutionId: string } }
) {
  const session = await auth()
  if (!session || session.user.portalType !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  try {
    // Separate query to preserve Prisma's inferred type with sections
    const classes = await prisma.class.findMany({
      where: { institutionId: params.institutionId },
      include: { sections: { select: { id: true } } },
      orderBy: { gradeLevel: 'asc' },
    })

    const [studentCount, academicYear] = await Promise.all([
      prisma.student.count({
        where: { institutionId: params.institutionId },
      }),
      prisma.academicYear.findFirst({
        where: {
          institutionId: params.institutionId,
          isCurrent: true,
        },
        select: { id: true },
      }),
    ])

    return NextResponse.json({
      classCount: classes.length,
      sectionCount: classes.reduce((sum, c) => sum + c.sections.length, 0),
      studentCount,
      hasAcademicYear: !!academicYear,
      classes: classes.map(c => ({
        id: c.id, name: c.name,
        gradeLevel: c.gradeLevel,
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
