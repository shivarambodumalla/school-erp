import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/server/auth'
import { prisma } from '@/lib/prisma'

type Ctx = { params: Promise<{ staffId: string }> }

export async function POST(req: NextRequest, ctx: Ctx) {
  const session = await auth()
  if (!session || session.user.portalType !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const institutionId = session.user.institutionId
  const { staffId } = await ctx.params

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
      assignedById: session.user.id,
    },
    include: { staffRole: { select: { id: true, name: true } } },
  })

  return NextResponse.json(assignment, { status: 201 })
}

export async function DELETE(req: NextRequest, ctx: Ctx) {
  const session = await auth()
  if (!session || session.user.portalType !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const institutionId = session.user.institutionId
  const { staffId } = await ctx.params

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
