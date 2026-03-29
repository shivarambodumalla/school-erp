import { NextRequest, NextResponse } from 'next/server'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'

interface RouteContext {
  params: Promise<{ staffId: string }>
}

export async function GET(req: NextRequest,routeCtx: RouteContext) {
  const ctx = await getSchoolContext(req, ['ADMIN', 'TEACHER'])
    if (isApiError(ctx)) return ctx
    const { institutionId } = ctx
  const { staffId } = await routeCtx.params
  const sp = req.nextUrl.searchParams
  const month = Number(sp.get('month') ?? new Date().getMonth() + 1)
  const year = Number(sp.get('year') ?? new Date().getFullYear())

  try {
    const startDate = new Date(Date.UTC(year, month - 1, 1))
    const endDate = new Date(Date.UTC(year, month, 0))

    const records = await prisma.staffAttendance.findMany({
      where: {
        institutionId,
        staffId,
        date: { gte: startDate, lte: endDate },
      },
      orderBy: { date: 'asc' },
    })

    const daysInMonth = endDate.getUTCDate()
    let present = 0
    let absent = 0
    let halfDay = 0
    let onLeave = 0
    let late = 0

    for (const r of records) {
      if (r.status === 'PRESENT') present++
      else if (r.status === 'ABSENT') absent++
      else if (r.status === 'HALF_DAY') halfDay++
      else if (r.status === 'ON_LEAVE') onLeave++
      else if (r.status === 'LATE') late++
    }

    const workedDays = present + late + halfDay * 0.5
    const pct = daysInMonth > 0
      ? Math.round((workedDays / daysInMonth) * 100)
      : 0

    return NextResponse.json({
      records: records.map((r) => ({
        id: r.id,
        date: r.date.toISOString().slice(0, 10),
        status: r.status,
        checkInTime: r.checkInTime,
        checkOutTime: r.checkOutTime,
        notes: r.notes,
      })),
      summary: { present, absent, halfDay, onLeave, late, total: daysInMonth, pct },
    })
  } catch (err) {
    console.error('GET staff/:id/attendance error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
