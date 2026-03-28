import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/server/auth'
import { prisma } from '@/lib/prisma'

type RouteContext = { params: Promise<{ classYearId: string }> }

export async function GET(
  _req: NextRequest,
  context: RouteContext
) {
  const session = await auth()
  if (!session || session.user.portalType !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const institutionId = session.user.institutionId
  if (!institutionId) {
    return NextResponse.json({ error: 'No institution' }, { status: 400 })
  }

  try {
    const { classYearId } = await context.params

    const classYear = await prisma.classYear.findFirst({
      where: { id: classYearId, institutionId },
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
        subjects: {
          select: {
            id: true,
            name: true,
            code: true,
            weeklyPeriods: true,
            teachers: {
              select: {
                user: { select: { email: true } },
                isPrimary: true,
              },
            },
          },
          orderBy: { name: 'asc' },
        },
        _count: { select: { sections: true, subjects: true } },
      },
    })

    if (!classYear) {
      return NextResponse.json({ error: 'Class year not found' }, { status: 404 })
    }

    return NextResponse.json(classYear)
  } catch (err) {
    console.error('GET /api/school/classes/[classYearId] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  context: RouteContext
) {
  const session = await auth()
  if (!session || session.user.portalType !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const institutionId = session.user.institutionId
  if (!institutionId) {
    return NextResponse.json({ error: 'No institution' }, { status: 400 })
  }

  try {
    const { classYearId } = await context.params
    const body = await req.json() as { status?: string }

    const classYear = await prisma.classYear.findFirst({
      where: { id: classYearId, institutionId },
    })
    if (!classYear) {
      return NextResponse.json({ error: 'Class year not found' }, { status: 404 })
    }

    const data: Record<string, unknown> = {}
    if (body.status) {
      data.status = body.status
    }

    const updated = await prisma.classYear.update({
      where: { id: classYearId },
      data,
    })

    return NextResponse.json(updated)
  } catch (err) {
    console.error('PATCH /api/school/classes/[classYearId] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
