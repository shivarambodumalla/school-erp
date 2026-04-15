import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function GET(req: NextRequest, { params }: RouteContext) {
  const ctx = await getSchoolContext(req, ['ADMIN', 'TEACHER', 'STUDENT'])
  if (isApiError(ctx)) return ctx
  const { institutionId } = ctx
  const { id } = await params

  const circular = await prisma.schoolCircular.findFirst({
    where: { id, institutionId },
    include: {
      createdBy: { select: { id: true, firstName: true, lastName: true } },
      _count: { select: { reads: true } },
    },
  })

  if (!circular) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json(circular)
}

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  const ctx = await getSchoolContext(req, ['ADMIN'])
  if (isApiError(ctx)) return ctx
  const { institutionId } = ctx
  const { id } = await params

  const existing = await prisma.schoolCircular.findFirst({
    where: { id, institutionId },
    select: { id: true },
  })

  if (!existing) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const body = (await req.json()) as Record<string, unknown>

  const allowedFields = [
    'title', 'content', 'targetAudience', 'targetClassIds',
    'isPinned', 'fileUrls', 'expiresAt',
  ] as const

  const data: Record<string, unknown> = {}
  for (const key of allowedFields) {
    if (key in body) {
      data[key] = key === 'expiresAt' && body[key]
        ? new Date(body[key] as string)
        : body[key]
    }
  }

  const updated = await prisma.schoolCircular.update({
    where: { id },
    data,
  })

  return NextResponse.json(updated)
}

export async function DELETE(req: NextRequest, { params }: RouteContext) {
  const ctx = await getSchoolContext(req, ['ADMIN'])
  if (isApiError(ctx)) return ctx
  const { institutionId } = ctx
  const { id } = await params

  const existing = await prisma.schoolCircular.findFirst({
    where: { id, institutionId },
    select: { id: true },
  })

  if (!existing) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  // Cascade: reads are deleted via onDelete: Cascade on the relation
  await prisma.schoolCircular.delete({ where: { id } })

  return NextResponse.json({ deleted: true })
}
