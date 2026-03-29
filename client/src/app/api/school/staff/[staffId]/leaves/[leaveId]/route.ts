import { NextRequest, NextResponse } from 'next/server'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'
import { sendNotifications } from '@/lib/notifications'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { staffId: string; leaveId: string } },
) {
  const ctx = await getSchoolContext(req, ['ADMIN'])
    if (isApiError(ctx)) return ctx
    const { institutionId } = ctx

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
      approvedById: ctx.userId,
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
          markedById: ctx.userId,
        },
        create: {
          institutionId,
          staffId: params.staffId,
          date,
          status: 'ON_LEAVE',
          notes: `Leave: ${updated.leaveType.name}`,
          markedById: ctx.userId,
        },
      })
    }
  }

  // Notify staff member about leave decision
  try {
    const newStatus = body.status
    const staffMember = await prisma.staff.findUnique({
      where: { id: params.staffId },
      select: { userId: true }
    })
    if (staffMember?.userId) {
      await sendNotifications({
        institutionId,
        userIds: [staffMember.userId],
        type: newStatus === 'APPROVED' ? 'LEAVE_APPROVED' : 'LEAVE_REJECTED',
        title: newStatus === 'APPROVED' ? 'Leave approved' : 'Leave rejected',
        body: `Your leave request has been ${newStatus.toLowerCase()}.`,
      })
    }
  } catch (notifErr) {
    console.error('[Notifications] leave status error:', notifErr)
  }

  return NextResponse.json(updated)
}
