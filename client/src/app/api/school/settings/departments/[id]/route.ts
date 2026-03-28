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

  const existing = await prisma.department.findFirst({
    where: { id, institutionId },
  })
  if (!existing) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const body = (await req.json()) as {
    name?: string
    description?: string
    hodId?: string | null
  }

  const data: Record<string, unknown> = {}
  if (body.name !== undefined) data.name = body.name.trim()
  if (body.description !== undefined) data.description = body.description?.trim() || null
  if (body.hodId !== undefined) data.hodId = body.hodId

  if (body.name) {
    const duplicate = await prisma.department.findFirst({
      where: { institutionId, name: body.name.trim(), id: { not: id } },
    })
    if (duplicate) {
      return NextResponse.json(
        { error: 'A department with this name already exists' },
        { status: 409 },
      )
    }
  }

  const updated = await prisma.department.update({
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

  const existing = await prisma.department.findFirst({
    where: { id, institutionId },
    include: { _count: { select: { staff: true } } },
  })
  if (!existing) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  if (existing._count.staff > 0) {
    return NextResponse.json(
      { error: `Cannot delete: ${existing._count.staff} staff members belong to this department` },
      { status: 400 },
    )
  }

  await prisma.department.delete({ where: { id } })

  return NextResponse.json({ deleted: true })
}
