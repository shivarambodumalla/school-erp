import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/server/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { staffId: string; leaveId: string } },
) {
  const session = await auth()
  if (!session || session.user.portalType !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const institutionId = session.user.institutionId

  const body = await req.json() as {
    status: 'APPROVED' | 'REJECTED' | 'CANCELLED'
    approvalComment?: string
  }

  const leave = await prisma.staffLeave.findFirst({
    where: {
      id: params.leaveId,
      staffId: params.staffId,
      institutionId,
    },
  })

  if (!leave) {
    return NextResponse.json({ error: 'Leave not found' }, { status: 404 })
  }

  if (leave.status !== 'PENDING') {
    return NextResponse.json(
      { error: 'Only pending leaves can be updated' },
      { status: 400 },
    )
  }

  const updated = await prisma.staffLeave.update({
    where: { id: params.leaveId },
    data: {
      status: body.status,
      approvalComment: body.approvalComment ?? null,
      approvedById: session.user.id,
      reviewedAt: new Date(),
    },
    include: {
      leaveType: { select: { name: true, shortName: true } },
    },
  })

  if (body.status === 'APPROVED') {
    const dates: Date[] = []
    const current = new Date(leave.fromDate)
    const end = new Date(leave.toDate)
    while (current <= end) {
      if (current.getDay() !== 0) {
        dates.push(new Date(current))
      }
      current.setDate(current.getDate() + 1)
    }

    for (const date of dates) {
      await prisma.staffAttendance.upsert({
        where: {
          staffId_date: {
            staffId: params.staffId,
            date,
          },
        },
        update: {
          status: 'ON_LEAVE',
          notes: `Leave: ${updated.leaveType.name}`,
          markedById: session.user.id,
        },
        create: {
          institutionId,
          staffId: params.staffId,
          date,
          status: 'ON_LEAVE',
          notes: `Leave: ${updated.leaveType.name}`,
          markedById: session.user.id,
        },
      })
    }
  }

  return NextResponse.json(updated)
}
