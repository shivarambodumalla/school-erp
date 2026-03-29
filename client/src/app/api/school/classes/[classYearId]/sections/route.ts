import { NextRequest, NextResponse } from 'next/server'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'

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
    })
    if (!classYear) {
      return NextResponse.json({ error: 'Class year not found' }, { status: 404 })
    }

    const sections = await prisma.section.findMany({
      where: { classYearId, institutionId },
      select: {
        id: true,
        name: true,
        maxStrength: true,
        classTeacherId: true,
        _count: { select: { students: true } },
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json(sections)
  } catch (err) {
    console.error('GET /api/school/classes/[classYearId]/sections error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  req: NextRequest,
  context: RouteContext
) {
  const ctx = await getSchoolContext(req, ['ADMIN'])
    if (isApiError(ctx)) return ctx
    const { institutionId } = ctx

  try {
    const { classYearId } = await context.params
    const body = await req.json() as {
      name: string
      maxStrength?: number
      classTeacherId?: string
    }

    if (!body.name) {
      return NextResponse.json({ error: 'name is required' }, { status: 400 })
    }

    const classYear = await prisma.classYear.findFirst({
      where: { id: classYearId, institutionId },
    })
    if (!classYear) {
      return NextResponse.json({ error: 'Class year not found' }, { status: 404 })
    }

    const existing = await prisma.section.findUnique({
      where: { classYearId_name: { classYearId, name: body.name } },
    })
    if (existing) {
      return NextResponse.json(
        { error: 'A section with this name already exists in this class' },
        { status: 409 }
      )
    }

    const section = await prisma.section.create({
      data: {
        institutionId,
        classYearId,
        name: body.name,
        maxStrength: body.maxStrength,
        classTeacherId: body.classTeacherId,
      },
    })

    return NextResponse.json(section, { status: 201 })
  } catch (err) {
    console.error('POST /api/school/classes/[classYearId]/sections error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
