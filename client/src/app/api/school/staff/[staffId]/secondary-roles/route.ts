import { NextRequest, NextResponse } from 'next/server'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'

type Ctx = { params: Promise<{ staffId: string }> }

export async function POST(req: NextRequest,routeCtx: Ctx) {
  const ctx = await getSchoolContext(req, ['ADMIN'])
    if (isApiError(ctx)) return ctx
    const { institutionId } = ctx
  const { staffId } = await routeCtx.params

  const staff = await prisma.staff.findFirst({
    where: { id: staffId, institutionId },
    select: { id: true },
  })
  if (!staff) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const { staffRoleId } = (await req.json()) as { staffRoleId: string }

  const existing = await prisma.staffRoleAssignment.findUnique({
    where: { staffId_staffRoleId: { staffId, staffRoleId } },
  })
  if (existing) {
    return NextResponse.json(
      { error: 'Role already assigned' },
      { status: 409 },
    )
  }

  const assignment = await prisma.staffRoleAssignment.create({
    data: {
      staffId,
      staffRoleId,
      assignedById: ctx.userId,
    },
    include: { staffRole: { select: { id: true, name: true } } },
  })

  return NextResponse.json(assignment, { status: 201 })
}

export async function DELETE(req: NextRequest,routeCtx: Ctx) {
  const ctx = await getSchoolContext(req, ['ADMIN'])
    if (isApiError(ctx)) return ctx
    const { institutionId } = ctx
  const { staffId } = await routeCtx.params

  const staff = await prisma.staff.findFirst({
    where: { id: staffId, institutionId },
    select: { id: true },
  })
  if (!staff) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const { staffRoleId } = (await req.json()) as { staffRoleId: string }

  await prisma.staffRoleAssignment.delete({
    where: { staffId_staffRoleId: { staffId, staffRoleId } },
  })

  return NextResponse.json({ ok: true })
}
