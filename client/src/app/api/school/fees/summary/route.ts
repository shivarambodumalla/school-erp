import { NextResponse } from 'next/server'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  const ctx = await getSchoolContext(req, ['ADMIN'])
  if (isApiError(ctx)) return ctx
  const { institutionId } = ctx
  const url = new URL(req.url)
  const month = url.searchParams.get('month')
  const year = url.searchParams.get('year')

  const where: Record<string, unknown> = { institutionId }
  if (month) where.month = Number(month)
  if (year) where.year = Number(year)

  const payments = await prisma.feePayment.findMany({
    where,
    include: { feeCategory: { select: { name: true } } },
  })

  let totalDue = 0, totalCollected = 0, totalPending = 0
  let totalOverdue = 0, totalWaived = 0, overdueCount = 0

  for (const p of payments) {
    const amt = Number(p.totalAmount)
    totalDue += amt
    if (p.status === 'PAID') totalCollected += amt
    else if (p.status === 'PENDING') totalPending += amt
    else if (p.status === 'OVERDUE') { totalOverdue += amt; overdueCount++ }
    else if (p.status === 'WAIVED') totalWaived += amt
  }

  const collectionRate = totalDue > 0 ? Math.round((totalCollected / totalDue) * 100) : 0

  // Chart data: last 6 months
  const now = new Date()
  const chartData: { month: string; collected: number; pending: number; overdue: number }[] = []
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const m = d.getMonth() + 1
    const y = d.getFullYear()
    const monthPayments = await prisma.feePayment.findMany({
      where: { institutionId, month: m, year: y },
    })
    let c = 0, pe = 0, o = 0
    for (const p of monthPayments) {
      const a = Number(p.totalAmount)
      if (p.status === 'PAID') c += a
      else if (p.status === 'PENDING') pe += a
      else if (p.status === 'OVERDUE') o += a
    }
    chartData.push({ month: MONTHS[d.getMonth()], collected: c, pending: pe, overdue: o })
  }

  // By category
  const catMap = new Map<string, { due: number; collected: number }>()
  for (const p of payments) {
    const name = p.feeCategory.name
    const entry = catMap.get(name) ?? { due: 0, collected: 0 }
    entry.due += Number(p.totalAmount)
    if (p.status === 'PAID') entry.collected += Number(p.totalAmount)
    catMap.set(name, entry)
  }
  const byCategory = Array.from(catMap, ([categoryName, v]) => ({
    categoryName,
    due: v.due,
    collected: v.collected,
    pct: v.due > 0 ? Math.round((v.collected / v.due) * 100) : 0,
  }))

  return NextResponse.json({
    totalDue, totalCollected, totalPending,
    totalOverdue, totalWaived, collectionRate,
    overdueCount, chartData, byCategory,
  })
}