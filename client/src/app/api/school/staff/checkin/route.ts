import { NextResponse } from 'next/server'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const ctx = await getSchoolContext(req, ['TEACHER'])
    if (isApiError(ctx)) return ctx
    const { institutionId } = ctx

  try {
    const staff = await prisma.staff.findFirst({
      where: { institutionId, userId: ctx.userId, status: 'ACTIVE' },
    })

    if (!staff) {
      return NextResponse.json(
        { error: 'Staff record not found' },
        { status: 404 },
      )
    }

    const today = new Date()
    const dateOnly = new Date(
      Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()),
    )

    const existing = await prisma.staffAttendance.findUnique({
      where: { staffId_date: { staffId: staff.id, date: dateOnly } },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Already checked in today' },
        { status: 409 },
      )
    }

    const now = today.toTimeString().slice(0, 5)
    const record = await prisma.staffAttendance.create({
      data: {
        institutionId,
        staffId: staff.id,
        date: dateOnly,
        status: 'PRESENT',
        checkInTime: now,
        markedById: ctx.userId,
      },
    })

    return NextResponse.json({
      id: record.id,
      checkInTime: record.checkInTime,
      status: record.status,
    })
  } catch (err) {
    console.error('POST staff/checkin error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}

export async function PATCH(req: Request) {
  const ctx = await getSchoolContext(req, ['TEACHER'])
    if (isApiError(ctx)) return ctx
    const { institutionId } = ctx

  try {
    const staff = await prisma.staff.findFirst({
      where: { institutionId, userId: ctx.userId, status: 'ACTIVE' },
    })

    if (!staff) {
      return NextResponse.json(
        { error: 'Staff record not found' },
        { status: 404 },
      )
    }

    const today = new Date()
    const dateOnly = new Date(
      Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()),
    )

    const existing = await prisma.staffAttendance.findUnique({
      where: { staffId_date: { staffId: staff.id, date: dateOnly } },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'No check-in found today' },
        { status: 404 },
      )
    }

    if (existing.checkOutTime) {
      return NextResponse.json(
        { error: 'Already checked out' },
        { status: 409 },
      )
    }

    const now = today.toTimeString().slice(0, 5)
    const record = await prisma.staffAttendance.update({
      where: { id: existing.id },
      data: { checkOutTime: now },
    })

    return NextResponse.json({
      id: record.id,
      checkInTime: record.checkInTime,
      checkOutTime: record.checkOutTime,
    })
  } catch (err) {
    console.error('PATCH staff/checkin error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
