import { NextResponse } from 'next/server'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export async function GET(req: Request) {
  const ctx = await getSchoolContext(req, ['ADMIN'])
  if (isApiError(ctx)) return ctx
  const { institutionId } = ctx
  const url = new URL(req.url)
  const fromMonth = Number(url.searchParams.get('fromMonth') ?? '1')
  const toMonth = Number(url.searchParams.get('toMonth') ?? '12')
  const year = Number(url.searchParams.get('year') ?? new Date().getFullYear())

  const payments = await prisma.feePayment.findMany({
    where: {
      institutionId,
      year,
      month: { gte: fromMonth, lte: toMonth },
    },
    include: {
      feeCategory: { select: { name: true } },
      student: { select: { id: true, firstName: true, lastName: true, admissionNo: true } },
    },
  })

  let totalDue = 0, totalCollected = 0, totalPending = 0
  for (const p of payments) {
    const a = Number(p.totalAmount)
    totalDue += a
    if (p.status === 'PAID') totalCollected += a
    else totalPending += a
  }
  const collectionRate = totalDue > 0 ? Math.round((totalCollected / totalDue) * 100) : 0

  // By category
  const catMap = new Map<string, { due: number; collected: number; defaulters: Set<string> }>()
  for (const p of payments) {
    const name = p.feeCategory.name
    const e = catMap.get(name) ?? { due: 0, collected: 0, defaulters: new Set<string>() }
    e.due += Number(p.totalAmount)
    if (p.status === 'PAID') e.collected += Number(p.totalAmount)
    else if (p.status === 'OVERDUE' || p.status === 'PENDING') e.defaulters.add(p.studentId)
    catMap.set(name, e)
  }
  const byCategory = Array.from(catMap, ([name, v]) => ({
    name, due: v.due, collected: v.collected,
    pct: v.due > 0 ? Math.round((v.collected / v.due) * 100) : 0,
    defaulters: v.defaulters.size,
  }))

  // Monthly
  const monthly: { month: string; collected: number; pending: number; overdue: number }[] = []
  for (let m = fromMonth; m <= toMonth; m++) {
    let c = 0, pe = 0, o = 0
    for (const p of payments) {
      if (p.month !== m) continue
      const a = Number(p.totalAmount)
      if (p.status === 'PAID') c += a
      else if (p.status === 'PENDING') pe += a
      else if (p.status === 'OVERDUE') o += a
    }
    monthly.push({ month: MONTHS[m - 1], collected: c, pending: pe, overdue: o })
  }

  // Top defaulters
  const studentOverdue = new Map<string, { name: string; admissionNo: string; total: number }>()
  for (const p of payments) {
    if (p.status !== 'OVERDUE' && p.status !== 'PENDING') continue
    const key = p.studentId
    const e = studentOverdue.get(key) ?? {
      name: `${p.student.firstName} ${p.student.lastName}`,
      admissionNo: p.student.admissionNo,
      total: 0,
    }
    e.total += Number(p.totalAmount)
    studentOverdue.set(key, e)
  }
  const topDefaulters = Array.from(studentOverdue.values())
    .sort((a, b) => b.total - a.total)
    .slice(0, 10)

  // Method breakdown
  const methodMap = new Map<string, { count: number; amount: number }>()
  for (const p of payments) {
    if (p.status !== 'PAID' || !p.method) continue
    const e = methodMap.get(p.method) ?? { count: 0, amount: 0 }
    e.count++
    e.amount += Number(p.totalAmount)
    methodMap.set(p.method, e)
  }
  const methodBreakdown = Array.from(methodMap, ([method, v]) => ({
    method, count: v.count, amount: v.amount,
  }))

  return NextResponse.json({
    totalDue, totalCollected, totalPending, collectionRate,
    byCategory, monthly, topDefaulters, methodBreakdown,
  })
}