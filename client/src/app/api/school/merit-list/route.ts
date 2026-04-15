import { NextResponse, type NextRequest } from 'next/server'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const ctx = await getSchoolContext(req, ['ADMIN', 'TEACHER'])
  if (isApiError(ctx)) return ctx
  const { institutionId } = ctx

  const configs = await prisma.meritListConfig.findMany({
    where: { institutionId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      totalSeats: true,
      cutoffScore: true,
      publishedAt: true,
      createdAt: true,
      targetClass: { select: { id: true, name: true } },
      academicYear: { select: { id: true, name: true } },
      _count: { select: { entries: true } },
    },
  })

  return NextResponse.json({ configs })
}

export async function POST(req: NextRequest) {
  const ctx = await getSchoolContext(req, ['ADMIN'])
  if (isApiError(ctx)) return ctx
  const { institutionId } = ctx

  const body = (await req.json()) as Record<string, unknown>

  const name = typeof body.name === 'string' ? body.name.trim() : ''
  const targetClassId = typeof body.targetClassId === 'string' ? body.targetClassId : ''
  const academicYearId = typeof body.academicYearId === 'string' ? body.academicYearId : ''
  const totalSeats = typeof body.totalSeats === 'number' ? body.totalSeats : 0
  const cutoffScore = typeof body.cutoffScore === 'number' ? body.cutoffScore : null
  const rankingCriteria = body.rankingCriteria ?? {}

  if (!name || !targetClassId || !academicYearId || totalSeats < 1) {
    return NextResponse.json(
      { error: 'name, targetClassId, academicYearId and totalSeats (>0) are required' },
      { status: 400 },
    )
  }

  // Verify class and academic year belong to institution
  const [classTemplate, academicYear] = await Promise.all([
    prisma.classTemplate.findFirst({
      where: { id: targetClassId, institutionId },
      select: { id: true },
    }),
    prisma.academicYear.findFirst({
      where: { id: academicYearId, institutionId },
      select: { id: true },
    }),
  ])

  if (!classTemplate) {
    return NextResponse.json({ error: 'Class not found' }, { status: 404 })
  }
  if (!academicYear) {
    return NextResponse.json({ error: 'Academic year not found' }, { status: 404 })
  }

  // Check uniqueness
  const existing = await prisma.meritListConfig.findFirst({
    where: { institutionId, targetClassId, academicYearId },
    select: { id: true },
  })

  if (existing) {
    return NextResponse.json(
      { error: 'A merit list already exists for this class and academic year' },
      { status: 409 },
    )
  }

  const config = await prisma.meritListConfig.create({
    data: {
      institutionId,
      name,
      targetClassId,
      academicYearId,
      totalSeats,
      cutoffScore,
      rankingCriteria,
    },
    select: { id: true, name: true },
  })

  return NextResponse.json(config, { status: 201 })
}
