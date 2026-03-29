import { NextResponse } from 'next/server'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: Request,
  { params }: { params: { studentId: string } },
) {
  const ctx = await getSchoolContext(req, ['ADMIN', 'TEACHER'])
    if (isApiError(ctx)) return ctx
    const { institutionId } = ctx

  const student = await prisma.student.findUnique({
    where: { id: params.studentId },
    select: {
      id: true,
      institutionId: true,
      guardians: {
        where: {
          OR: [{ isPrimaryContact: true }, { isEmergencyContact: true }],
        },
        select: {
          id: true, type: true, name: true, phone: true,
          email: true, isPrimaryContact: true, isEmergencyContact: true,
        },
      },
    },
  })

  if (!student || student.institutionId !== institutionId) {
    return NextResponse.json({ error: 'Student not found' }, { status: 404 })
  }

  // Current month boundaries
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)

  const [attendanceRecords, pendingFees, paidFees, lastPayment] =
    await Promise.all([
      // Attendance this month
      prisma.attendance.groupBy({
        by: ['status'],
        where: {
          studentId: student.id,
          institutionId,
          date: { gte: monthStart, lte: monthEnd },
        },
        _count: true,
      }),

      // Pending fees
      prisma.feePayment.aggregate({
        where: { studentId: student.id, institutionId, status: 'PENDING' },
        _sum: { amount: true },
      }),

      // Paid fees
      prisma.feePayment.aggregate({
        where: { studentId: student.id, institutionId, status: 'PAID' },
        _sum: { amount: true },
      }),

      // Last payment date
      prisma.feePayment.findFirst({
        where: { studentId: student.id, institutionId, status: 'PAID' },
        orderBy: { paidAt: 'desc' },
        select: { paidAt: true },
      }),
    ])

  // Process attendance
  const attMap: Record<string, number> = {}
  for (const row of attendanceRecords) {
    attMap[row.status] = row._count
  }
  const present = attMap['PRESENT'] ?? 0
  const absent = attMap['ABSENT'] ?? 0
  const late = attMap['LATE'] ?? 0
  const halfDay = attMap['HALF_DAY'] ?? 0
  const excused = attMap['EXCUSED'] ?? 0
  const total = present + absent + late + halfDay + excused
  const pct = total > 0 ? Math.round(((present + late + halfDay) / total) * 100) : 100

  const attendance = { present, absent, late, halfDay, excused, total, pct }

  // Fees summary
  const pendingAmount = Number(pendingFees._sum.amount ?? 0)
  const paidAmount = Number(paidFees._sum.amount ?? 0)
  const fees = {
    pendingAmount,
    paidAmount,
    lastPaymentDate: lastPayment?.paidAt?.toISOString() ?? null,
  }

  // Courses — model doesn't exist yet, return []
  const courses: unknown[] = []

  // Grades — model doesn't exist yet, return []
  const grades: unknown[] = []

  // Timetable — model doesn't exist yet, return []
  const todaySlots: unknown[] = []

  // Risk score (rule-based)
  let riskScore = 0
  if (pct < 75) riskScore += 30
  if (pendingAmount > 0) riskScore += 20
  // courseProgress avg — no data yet
  const riskLevel =
    riskScore <= 25 ? 'GREEN' :
    riskScore <= 50 ? 'AMBER' :
    riskScore <= 75 ? 'RED' : 'CRITICAL'

  return NextResponse.json({
    attendance,
    fees,
    courses,
    grades,
    todaySlots,
    riskScore,
    riskLevel,
    guardians: student.guardians,
  })
}
