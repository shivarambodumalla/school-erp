import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/server/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: { staffId: string } },
) {
  const session = await auth()
  if (!session || session.user.portalType !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const institutionId = session.user.institutionId

  const leaves = await prisma.staffLeave.findMany({
    where: { institutionId, staffId: params.staffId },
    include: {
      leaveType: { select: { name: true, shortName: true } },
    },
    orderBy: { appliedAt: 'desc' },
  })

  return NextResponse.json(leaves)
}

function countWeekdays(from: Date, to: Date): number {
  let count = 0
  const current = new Date(from)
  while (current <= to) {
    if (current.getDay() !== 0) count++
    current.setDate(current.getDate() + 1)
  }
  return count
}

export async function POST(
  req: NextRequest,
  { params }: { params: { staffId: string } },
) {
  const session = await auth()
  if (!session || session.user.portalType !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const institutionId = session.user.institutionId

  const body = await req.json() as {
    leaveTypeId: string
    fromDate: string
    toDate: string
    reason: string
    substituteArranged?: boolean
    substituteStaffId?: string
  }

  const fromDate = new Date(body.fromDate + 'T00:00:00.000Z')
  const toDate = new Date(body.toDate + 'T00:00:00.000Z')

  if (toDate < fromDate) {
    return NextResponse.json(
      { error: 'toDate must be after fromDate' },
      { status: 400 },
    )
  }

  const totalDays = countWeekdays(fromDate, toDate)

  const leaveType = await prisma.staffLeaveType.findFirst({
    where: { id: body.leaveTypeId, institutionId },
  })

  if (!leaveType) {
    return NextResponse.json(
      { error: 'Leave type not found' },
      { status: 404 },
    )
  }

  const yearStart = new Date(`${fromDate.getFullYear()}-01-01T00:00:00.000Z`)
  const yearEnd = new Date(`${fromDate.getFullYear()}-12-31T23:59:59.999Z`)

  const usedCount = await prisma.staffLeave.aggregate({
    where: {
      institutionId,
      staffId: params.staffId,
      leaveTypeId: body.leaveTypeId,
      status: 'APPROVED',
      fromDate: { gte: yearStart },
      toDate: { lte: yearEnd },
    },
    _sum: { totalDays: true },
  })

  const used = usedCount._sum.totalDays ?? 0
  const remaining = leaveType.maxDaysPerYear - used

  if (totalDays > remaining) {
    return NextResponse.json(
      { error: `Insufficient leave balance. Remaining: ${remaining} days` },
      { status: 400 },
    )
  }

  const created = await prisma.staffLeave.create({
    data: {
      institutionId,
      staffId: params.staffId,
      leaveTypeId: body.leaveTypeId,
      fromDate,
      toDate,
      totalDays,
      reason: body.reason,
      status: 'PENDING',
      substituteArranged: body.substituteArranged ?? false,
      substituteStaffId: body.substituteStaffId ?? null,
    },
    include: {
      leaveType: { select: { name: true, shortName: true } },
    },
  })

  return NextResponse.json(created, { status: 201 })
}
