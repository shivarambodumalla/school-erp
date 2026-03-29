import { NextRequest, NextResponse } from 'next/server'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'

type Ctx = { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest,routeCtx: Ctx) {
  const ctx = await getSchoolContext(req, ['ADMIN'])
    if (isApiError(ctx)) return ctx
    const { institutionId } = ctx
  const { id } = await routeCtx.params

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

export async function DELETE(req: NextRequest,routeCtx: Ctx) {
  const ctx = await getSchoolContext(req, ['ADMIN'])
    if (isApiError(ctx)) return ctx
    const { institutionId } = ctx
  const { id } = await routeCtx.params

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
