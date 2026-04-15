import { NextResponse, type NextRequest } from 'next/server'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const ctx = await getSchoolContext(req, ['ADMIN'])
  if (isApiError(ctx)) return ctx
  const { institutionId } = ctx

  try {
    const generations = await prisma.reportCardGeneration.findMany({
      where: { institutionId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        classYearId: true,
        academicYearId: true,
        examTypeIds: true,
        includeAttendance: true,
        includeRemarks: true,
        gradingScale: true,
        status: true,
        generatedAt: true,
        publishedAt: true,
        createdAt: true,
        classYear: {
          select: {
            classTemplate: { select: { name: true } },
          },
        },
        academicYear: { select: { name: true } },
        _count: { select: { cards: true } },
      },
    })

    // Fetch exam type names for display
    const allExamTypeIds = Array.from(new Set(generations.flatMap((g) => g.examTypeIds)))
    const examTypes = allExamTypeIds.length > 0
      ? await prisma.examType.findMany({
          where: { institutionId, id: { in: allExamTypeIds } },
          select: { id: true, name: true },
        })
      : []

    const examTypeMap = new Map(examTypes.map((et) => [et.id, et.name]))

    const items = generations.map((g) => ({
      id: g.id,
      className: g.classYear.classTemplate.name,
      academicYear: g.academicYear.name,
      examTypes: g.examTypeIds.map((id) => examTypeMap.get(id) ?? id),
      includeAttendance: g.includeAttendance,
      includeRemarks: g.includeRemarks,
      status: g.status,
      cardCount: g._count.cards,
      generatedAt: g.generatedAt,
      publishedAt: g.publishedAt,
      createdAt: g.createdAt,
    }))

    return NextResponse.json({ generations: items })
  } catch (err) {
    console.error('GET report-cards error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}

interface CreateBody {
  classYearId: string
  academicYearId: string
  examTypeIds: string[]
  gradingScale?: Record<string, string> | null
  includeAttendance?: boolean
  includeRemarks?: boolean
}

export async function POST(req: NextRequest) {
  const ctx = await getSchoolContext(req, ['ADMIN'])
  if (isApiError(ctx)) return ctx
  const { institutionId, userId } = ctx

  try {
    const body = (await req.json()) as CreateBody

    if (!body.classYearId || !body.academicYearId || !body.examTypeIds?.length) {
      return NextResponse.json(
        { error: 'classYearId, academicYearId, and examTypeIds are required' },
        { status: 400 },
      )
    }

    // Verify classYear belongs to institution
    const classYear = await prisma.classYear.findFirst({
      where: { id: body.classYearId, institutionId },
    })
    if (!classYear) {
      return NextResponse.json(
        { error: 'Class not found' },
        { status: 404 },
      )
    }

    // Verify academicYear belongs to institution
    const academicYear = await prisma.academicYear.findFirst({
      where: { id: body.academicYearId, institutionId },
    })
    if (!academicYear) {
      return NextResponse.json(
        { error: 'Academic year not found' },
        { status: 404 },
      )
    }

    const generation = await prisma.reportCardGeneration.create({
      data: {
        institutionId,
        classYearId: body.classYearId,
        academicYearId: body.academicYearId,
        examTypeIds: body.examTypeIds,
        gradingScale: body.gradingScale ?? undefined,
        includeAttendance: body.includeAttendance ?? true,
        includeRemarks: body.includeRemarks ?? true,
        createdById: userId,
      },
    })

    return NextResponse.json({ generation }, { status: 201 })
  } catch (err) {
    // Handle unique constraint violation
    if (
      err instanceof Error &&
      err.message.includes('Unique constraint')
    ) {
      return NextResponse.json(
        { error: 'A report card generation already exists for this class and academic year' },
        { status: 409 },
      )
    }
    console.error('POST report-cards error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
