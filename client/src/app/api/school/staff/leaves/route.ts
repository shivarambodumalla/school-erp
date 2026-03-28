import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/server/auth'
import { prisma } from '@/lib/prisma'
import type { Prisma, LeaveStatus } from '@prisma/client'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session || session.user.portalType !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const institutionId = session.user.institutionId
  const sp = req.nextUrl.searchParams

  const status = sp.get('status')
  const departmentId = sp.get('departmentId')
  const month = sp.get('month')
  const year = sp.get('year')

  const where: Prisma.StaffLeaveWhereInput = { institutionId }

  if (status && status !== 'ALL') {
    where.status = status as LeaveStatus
  }

  if (departmentId) {
    where.staff = { is: { departmentId } }
  }

  if (month && year) {
    const m = parseInt(month, 10)
    const y = parseInt(year, 10)
    const start = new Date(`${y}-${String(m).padStart(2, '0')}-01T00:00:00.000Z`)
    const end = new Date(y, m, 0, 23, 59, 59, 999)
    where.appliedAt = { gte: start, lte: end }
  } else if (year) {
    const y = parseInt(year, 10)
    where.appliedAt = {
      gte: new Date(`${y}-01-01T00:00:00.000Z`),
      lte: new Date(`${y}-12-31T23:59:59.999Z`),
    }
  }

  const leaves = await prisma.staffLeave.findMany({
    where,
    include: {
      staff: {
        select: {
          firstName: true,
          lastName: true,
          employeeNo: true,
          department: { select: { name: true } },
        },
      },
      leaveType: { select: { name: true } },
    },
    orderBy: { appliedAt: 'desc' },
  })

  return NextResponse.json(leaves)
}
