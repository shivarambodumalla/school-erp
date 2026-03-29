import { NextResponse } from 'next/server'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  const ctx = await getSchoolContext(req, ['PARENT'])
  if (isApiError(ctx)) return ctx
  const { userId, institutionId } = ctx

  const guardians = await prisma.guardian.findMany({
    where: { userId },
    select: { studentId: true },
  })
  const studentIds = guardians.filter(g => g.studentId).map(g => g.studentId!)

  if (studentIds.length === 0) {
    return NextResponse.json([])
  }

  const children = []
  for (const studentId of studentIds) {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: { id: true, firstName: true, lastName: true, admissionNo: true },
    })
    if (!student) continue

    const payments = await prisma.feePayment.findMany({
      where: { studentId, institutionId },
      include: { feeCategory: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
      take: 20,
    })

    let totalDue = 0, totalPaid = 0, totalPending = 0
    const pending = []
    const recent = []

    for (const p of payments) {
      const amt = Number(p.totalAmount)
      totalDue += amt
      if (p.status === 'PAID') { totalPaid += amt; recent.push(p) }
      else if (p.status === 'PENDING' || p.status === 'OVERDUE') {
        totalPending += amt; pending.push(p)
      }
    }

    children.push({
      childId: student.id,
      childName: `${student.firstName} ${student.lastName}`,
      admissionNo: student.admissionNo,
      summary: { totalDue, totalPaid, totalPending },
      pendingPayments: pending,
      recentPayments: recent.slice(0, 10),
    })
  }

  return NextResponse.json(children)
}