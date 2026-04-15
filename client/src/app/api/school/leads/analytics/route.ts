import { NextResponse } from 'next/server'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'

/** GET /api/school/leads/analytics — source breakdown, conversion funnel, monthly trend */
export async function GET(req: Request) {
  const ctx = await getSchoolContext(req, ['ADMIN'])
  if (isApiError(ctx)) return ctx
  const { institutionId } = ctx

  const [sourceBreakdown, statusBreakdown, monthlyRaw] = await Promise.all([
    // Source breakdown with status counts
    prisma.lead.groupBy({
      by: ['source', 'status'],
      where: { institutionId },
      _count: { id: true },
    }),
    // Overall status counts
    prisma.lead.groupBy({
      by: ['status'],
      where: { institutionId },
      _count: { id: true },
    }),
    // Monthly trend — raw leads grouped by month
    prisma.$queryRaw<Array<{ month: string; count: bigint }>>`
      SELECT TO_CHAR("createdAt", 'YYYY-MM') as month, COUNT(*) as count
      FROM "Lead"
      WHERE "institutionId" = ${institutionId}
      GROUP BY TO_CHAR("createdAt", 'YYYY-MM')
      ORDER BY month DESC
      LIMIT 12
    `,
  ])

  // Build source-level funnel: source → { total, contacted, interested, applied, converted, lost }
  const sourceMap: Record<string, Record<string, number>> = {}
  for (const row of sourceBreakdown) {
    if (!sourceMap[row.source]) {
      sourceMap[row.source] = { total: 0 }
    }
    sourceMap[row.source][row.status] = (sourceMap[row.source][row.status] ?? 0) + row._count.id
    sourceMap[row.source].total += row._count.id
  }

  const sourceFunnel = Object.entries(sourceMap).map(([source, data]) => ({
    source,
    total: data.total ?? 0,
    new: data.NEW ?? 0,
    contacted: data.CONTACTED ?? 0,
    interested: data.INTERESTED ?? 0,
    applied: data.APPLIED ?? 0,
    converted: data.CONVERTED ?? 0,
    lost: data.LOST ?? 0,
    conversionRate: data.total > 0
      ? Math.round(((data.CONVERTED ?? 0) / data.total) * 100)
      : 0,
  }))

  // Overall funnel
  const funnel: Record<string, number> = {}
  for (const row of statusBreakdown) {
    funnel[row.status] = row._count.id
  }

  // Monthly trend
  const monthlyTrend = monthlyRaw.map(row => ({
    month: row.month,
    count: Number(row.count),
  })).reverse()

  return NextResponse.json({
    sourceFunnel,
    funnel,
    monthlyTrend,
    totalLeads: Object.values(funnel).reduce((a, b) => a + b, 0),
  })
}
