import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/server/auth'
import { prisma } from '@/lib/prisma'

type Ctx = { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const session = await auth()
  if (!session || session.user.portalType !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const institutionId = session.user.institutionId
  const { id } = await ctx.params

  const existing = await prisma.staffLeaveType.findFirst({
    where: { id, institutionId },
  })
  if (!existing) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const body = (await req.json()) as {
    name?: string
    shortName?: string
    maxDaysPerYear?: number
    carryForward?: boolean
    isPaid?: boolean
  }

  const data: Record<string, unknown> = {}
  if (body.name !== undefined) data.name = body.name.trim()
  if (body.shortName !== undefined) data.shortName = body.shortName.trim()
  if (body.maxDaysPerYear !== undefined) data.maxDaysPerYear = body.maxDaysPerYear
  if (body.carryForward !== undefined) data.carryForward = body.carryForward
  if (body.isPaid !== undefined) data.isPaid = body.isPaid

  if (body.name) {
    const duplicate = await prisma.staffLeaveType.findFirst({
      where: { institutionId, name: body.name.trim(), id: { not: id } },
    })
    if (duplicate) {
      return NextResponse.json(
        { error: 'A leave type with this name already exists' },
        { status: 409 },
      )
    }
  }

  const updated = await prisma.staffLeaveType.update({
    where: { id },
    data,
  })

  return NextResponse.json(updated)
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const session = await auth()
  if (!session || session.user.portalType !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const institutionId = session.user.institutionId
  const { id } = await ctx.params

  const existing = await prisma.staffLeaveType.findFirst({
    where: { id, institutionId },
  })
  if (!existing) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const leaveCount = await prisma.staffLeave.count({
    where: { leaveTypeId: id, institutionId },
  })
  if (leaveCount > 0) {
    return NextResponse.json(
      { error: `Cannot delete: ${leaveCount} leave records use this type` },
      { status: 400 },
    )
  }

  await prisma.staffLeaveType.delete({ where: { id } })

  return NextResponse.json({ deleted: true })
}
