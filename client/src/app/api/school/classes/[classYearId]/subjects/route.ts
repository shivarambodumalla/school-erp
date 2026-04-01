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

    const subjects = await prisma.subject.findMany({
      where: { classYearId, institutionId },
      select: {
        id: true,
        serialNo: true,
        name: true,
        code: true,
        weeklyPeriods: true,
        hasOnlineContent: true,
        canPreviewFiles: true,
        canDownloadFiles: true,
        sectionId: true,
        teachers: {
          select: {
            user: { select: { email: true } },
            isPrimary: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json(subjects)
  } catch (err) {
    console.error('GET /api/school/classes/[classYearId]/subjects error:', err)
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
      code?: string
      weeklyPeriods: number
      teacherId: string
      sectionId?: string
      hasOnlineContent?: boolean
    }

    if (!body.name || body.weeklyPeriods == null || !body.teacherId) {
      return NextResponse.json(
        { error: 'name, weeklyPeriods, and teacherId are required' },
        { status: 400 }
      )
    }

    const classYear = await prisma.classYear.findFirst({
      where: { id: classYearId, institutionId },
    })
    if (!classYear) {
      return NextResponse.json({ error: 'Class year not found' }, { status: 404 })
    }

    const subject = await prisma.subject.create({
      data: {
        institutionId,
        classYearId,
        sectionId: body.sectionId ?? null,
        name: body.name,
        code: body.code,
        weeklyPeriods: body.weeklyPeriods,
        hasOnlineContent: body.hasOnlineContent ?? false,
        teachers: {
          create: {
            teacherId: body.teacherId,
            isPrimary: true,
          },
        },
      },
      include: {
        teachers: {
          select: {
            user: { select: { email: true } },
            isPrimary: true,
          },
        },
      },
    })

    return NextResponse.json(subject, { status: 201 })
  } catch (err) {
    console.error('POST /api/school/classes/[classYearId]/subjects error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
