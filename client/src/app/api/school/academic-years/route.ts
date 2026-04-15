import { NextRequest, NextResponse } from 'next/server'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'

const json = NextResponse.json

export async function GET(req: NextRequest) {
  const ctx = await getSchoolContext(req, ['ADMIN', 'TEACHER'])
  if (isApiError(ctx)) return ctx
  const { institutionId } = ctx

  try {
    const years = await prisma.academicYear.findMany({
      where: { institutionId },
      select: {
        id: true,
        name: true,
        startDate: true,
        endDate: true,
        isCurrent: true,
      },
      orderBy: { startDate: 'desc' },
    })

    return json(years)
  } catch (err) {
    console.error('GET /api/school/academic-years error:', err)
    return json({ error: 'Internal server error' }, { status: 500 })
  }
}
