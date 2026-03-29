import { NextResponse } from 'next/server'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ studentId: string }> }
) {
  const ctx = await getSchoolContext(req, ['ADMIN', 'TEACHER'])
  if (isApiError(ctx)) return ctx
  const { institutionId } = ctx
  const { studentId } = await params

  const [payments, concessions] = await Promise.all([
    prisma.feePayment.findMany({
      where: { studentId, institutionId },
      include: { feeCategory: { select: { name: true, frequency: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.feeConcession.findMany({
      where: { studentId, institutionId },
      orderBy: { createdAt: 'desc' },
    }),
  ])

  let totalDue = 0, totalPaid = 0, totalPending = 0, totalOverdue = 0
  for (const p of payments) {
    const amt = Number(p.totalAmount)
    totalDue += amt
    if (p.status === 'PAID') totalPaid += amt
    else if (p.status === 'PENDING') totalPending += amt
    else if (p.status === 'OVERDUE') totalOverdue += amt
  }

  return NextResponse.json({
    summary: { totalDue, totalPaid, totalPending, totalOverdue },
    payments,
    concessions,
  })
}