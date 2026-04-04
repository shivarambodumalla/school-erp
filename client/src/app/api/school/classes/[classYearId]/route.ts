import { NextRequest, NextResponse } from 'next/server'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'
import { checkClassYearHasNoData, handleDependencyError } from '@/lib/dependency-checks'

type RouteContext = { params: Promise<{ classYearId: string }> }

export async function GET(
  req: NextRequest,
  context: RouteContext
) {
  const ctx = await getSchoolContext(req, ['ADMIN'])
    if (isApiError(ctx)) return ctx
    const { institutionId } = ctx

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
  const ctx = await getSchoolContext(req, ['ADMIN'])
    if (isApiError(ctx)) return ctx
    const { institutionId } = ctx

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

export async function DELETE(
  req: NextRequest,
  context: RouteContext
) {
  const ctx = await getSchoolContext(req, ['ADMIN'])
    if (isApiError(ctx)) return ctx
    const { institutionId } = ctx

  try {
    const { classYearId } = await context.params
    const body = await req.json().catch(() => ({})) as { action?: string }

    const classYear = await prisma.classYear.findFirst({
      where: { id: classYearId, institutionId },
    })
    if (!classYear) {
      return NextResponse.json({ error: 'Class year not found' }, { status: 404 })
    }

    if (body.action === 'ARCHIVE') {
      const archived = await prisma.classYear.update({
        where: { id: classYearId },
        data: { status: 'ARCHIVED' },
      })
      return NextResponse.json(archived)
    }

    try { await checkClassYearHasNoData(classYearId) }
    catch (e) { return handleDependencyError(e) }

    await prisma.classYear.delete({ where: { id: classYearId } })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('DELETE /api/school/classes/[classYearId] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
