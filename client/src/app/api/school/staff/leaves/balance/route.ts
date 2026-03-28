import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/server/auth'
import { prisma } from '@/lib/prisma'

interface LeaveBalance {
  leaveTypeId: string
  name: string
  shortName: string
  total: number
  used: number
  remaining: number
  carryForward: boolean
}

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session || session.user.portalType !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const institutionId = session.user.institutionId
  const staffId = req.nextUrl.searchParams.get('staffId')

  if (!staffId) {
    return NextResponse.json(
      { error: 'staffId is required' },
      { status: 400 },
    )
  }

  const leaveTypes = await prisma.staffLeaveType.findMany({
    where: { institutionId },
  })

  const now = new Date()
  const yearStart = new Date(`${now.getFullYear()}-01-01T00:00:00.000Z`)
  const yearEnd = new Date(`${now.getFullYear()}-12-31T23:59:59.999Z`)

  const balances: LeaveBalance[] = []

  for (const lt of leaveTypes) {
    const usedAgg = await prisma.staffLeave.aggregate({
      where: {
        institutionId,
        staffId,
        leaveTypeId: lt.id,
        status: 'APPROVED',
        fromDate: { gte: yearStart },
        toDate: { lte: yearEnd },
      },
      _sum: { totalDays: true },
    })

    const used = usedAgg._sum.totalDays ?? 0

    balances.push({
      leaveTypeId: lt.id,
      name: lt.name,
      shortName: lt.shortName,
      total: lt.maxDaysPerYear,
      used,
      remaining: lt.maxDaysPerYear - used,
      carryForward: lt.carryForward,
    })
  }

  return NextResponse.json(balances)
}
