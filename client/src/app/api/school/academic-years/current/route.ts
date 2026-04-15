import { NextRequest, NextResponse } from 'next/server'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'

const json = NextResponse.json

export async function GET(req: NextRequest) {
  const ctx = await getSchoolContext(req, ['ADMIN', 'TEACHER'])
  if (isApiError(ctx)) return ctx
  const { institutionId, userId } = ctx

  try {
    // Check user preference first
    const pref = await prisma.academicYearPreference.findUnique({
      where: { userId },
      select: {
        academicYear: {
          select: { id: true, name: true, isCurrent: true },
        },
      },
    })

    if (pref) {
      return json(pref.academicYear)
    }

    // Fall back to isCurrent=true
    const current = await prisma.academicYear.findFirst({
      where: { institutionId, isCurrent: true },
      select: { id: true, name: true, isCurrent: true },
    })

    if (current) {
      return json(current)
    }

    // Fall back to the most recent year
    const latest = await prisma.academicYear.findFirst({
      where: { institutionId },
      select: { id: true, name: true, isCurrent: true },
      orderBy: { startDate: 'desc' },
    })

    if (latest) {
      return json(latest)
    }

    return json({ error: 'No academic years found' }, { status: 404 })
  } catch (err) {
    console.error('GET /api/school/academic-years/current error:', err)
    return json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  const ctx = await getSchoolContext(req, ['ADMIN', 'TEACHER'])
  if (isApiError(ctx)) return ctx
  const { institutionId, userId } = ctx

  try {
    const body = await req.json() as { academicYearId: string }

    if (!body.academicYearId) {
      return json({ error: 'academicYearId is required' }, { status: 400 })
    }

    // Verify the academic year belongs to this institution
    const year = await prisma.academicYear.findFirst({
      where: { id: body.academicYearId, institutionId },
      select: { id: true, name: true, isCurrent: true },
    })

    if (!year) {
      return json({ error: 'Academic year not found' }, { status: 404 })
    }

    // Upsert the preference
    await prisma.academicYearPreference.upsert({
      where: { userId },
      create: {
        userId,
        institutionId,
        academicYearId: body.academicYearId,
      },
      update: {
        academicYearId: body.academicYearId,
      },
    })

    return json(year)
  } catch (err) {
    console.error('PUT /api/school/academic-years/current error:', err)
    return json({ error: 'Internal server error' }, { status: 500 })
  }
}
