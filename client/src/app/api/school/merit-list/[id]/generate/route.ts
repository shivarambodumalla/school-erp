import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function POST(req: NextRequest, { params }: RouteContext) {
  const ctx = await getSchoolContext(req, ['ADMIN'])
  if (isApiError(ctx)) return ctx
  const { institutionId } = ctx
  const { id } = await params

  const config = await prisma.meritListConfig.findFirst({
    where: { id, institutionId },
    select: {
      id: true,
      academicYearId: true,
      totalSeats: true,
      cutoffScore: true,
      publishedAt: true,
    },
  })

  if (!config) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  if (config.publishedAt) {
    return NextResponse.json(
      { error: 'Cannot regenerate a published merit list' },
      { status: 400 },
    )
  }

  // Fetch all APPLIED admissions for this academic year
  const admissions = await prisma.admission.findMany({
    where: {
      institutionId,
      academicYearId: config.academicYearId,
      status: 'APPLIED',
    },
    select: { id: true },
  })

  if (admissions.length === 0) {
    return NextResponse.json(
      { error: 'No applied admissions found for this academic year' },
      { status: 400 },
    )
  }

  // TODO: Replace random scores with real criteria-based scoring
  const scored = admissions.map((a) => ({
    admissionId: a.id,
    score: Math.round(Math.random() * 100 * 100) / 100,
  }))

  // Rank by score descending
  scored.sort((a, b) => b.score - a.score)

  const cutoff = config.cutoffScore ?? 0

  const entries = scored.map((item, index) => {
    const rank = index + 1
    const withinSeats = rank <= config.totalSeats
    const aboveCutoff = item.score >= cutoff
    const status = aboveCutoff && withinSeats ? 'SELECTED' : 'WAITLISTED'

    return {
      meritListId: id,
      admissionId: item.admissionId,
      rank,
      score: item.score,
      status: status as 'SELECTED' | 'WAITLISTED',
    }
  })

  // Delete existing entries first (regenerate)
  await prisma.meritListEntry.deleteMany({
    where: { meritListId: id },
  })

  // Create new entries
  await prisma.meritListEntry.createMany({ data: entries })

  const created = await prisma.meritListEntry.findMany({
    where: { meritListId: id },
    orderBy: { rank: 'asc' },
    include: {
      admission: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          applicationNo: true,
        },
      },
    },
  })

  return NextResponse.json(created)
}
