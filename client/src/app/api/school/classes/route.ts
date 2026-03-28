import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/server/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session || session.user.portalType !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const institutionId = session.user.institutionId
  if (!institutionId) {
    return NextResponse.json({ error: 'No institution' }, { status: 400 })
  }

  try {
    const templates = await prisma.classTemplate.findMany({
      where: { institutionId },
      include: {
        classYears: {
          where: { academicYear: { isCurrent: true } },
          include: {
            sections: { select: { id: true } },
            studentSections: { where: { status: 'ACTIVE' }, select: { id: true } },
          },
        },
      },
      orderBy: { gradeLevel: 'asc' },
    })

    const result = templates.map((t) => {
      const activeYear = t.classYears[0] ?? null
      return {
        id: t.id,
        name: t.name,
        gradeLevel: t.gradeLevel,
        description: t.description,
        activeYear: activeYear
          ? {
              id: activeYear.id,
              status: activeYear.status,
              sectionCount: activeYear.sections.length,
              studentCount: activeYear.studentSections.length,
            }
          : null,
      }
    })

    return NextResponse.json(result)
  } catch (err) {
    console.error('GET /api/school/classes error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session || session.user.portalType !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const institutionId = session.user.institutionId
  if (!institutionId) {
    return NextResponse.json({ error: 'No institution' }, { status: 400 })
  }

  try {
    const body = await req.json() as { name: string; gradeLevel: number; description?: string }
    const { name, gradeLevel, description } = body

    if (!name || gradeLevel == null) {
      return NextResponse.json({ error: 'name and gradeLevel are required' }, { status: 400 })
    }

    const existing = await prisma.classTemplate.findUnique({
      where: { institutionId_name: { institutionId, name } },
    })
    if (existing) {
      return NextResponse.json({ error: 'A class with this name already exists' }, { status: 409 })
    }

    const currentAcademicYear = await prisma.academicYear.findFirst({
      where: { institutionId, isCurrent: true },
    })

    const template = await prisma.classTemplate.create({
      data: { institutionId, name, gradeLevel, description },
    })

    let classYear = null
    if (currentAcademicYear) {
      classYear = await prisma.classYear.create({
        data: {
          institutionId,
          classTemplateId: template.id,
          academicYearId: currentAcademicYear.id,
          status: 'ACTIVE',
        },
      })
    }

    return NextResponse.json({ ...template, classYear }, { status: 201 })
  } catch (err) {
    console.error('POST /api/school/classes error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
