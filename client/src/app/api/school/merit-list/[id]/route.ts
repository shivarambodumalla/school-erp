import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function GET(req: NextRequest, { params }: RouteContext) {
  const ctx = await getSchoolContext(req, ['ADMIN', 'TEACHER'])
  if (isApiError(ctx)) return ctx
  const { institutionId } = ctx
  const { id } = await params

  const config = await prisma.meritListConfig.findFirst({
    where: { id, institutionId },
    include: {
      targetClass: true,
      academicYear: true,
      entries: {
        orderBy: { rank: 'asc' },
        include: {
          admission: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              applicationNo: true,
            },
          },
        },
      },
    },
  })

  if (!config) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json(config)
}

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  const ctx = await getSchoolContext(req, ['ADMIN'])
  if (isApiError(ctx)) return ctx
  const { institutionId } = ctx
  const { id } = await params

  const existing = await prisma.meritListConfig.findFirst({
    where: { id, institutionId },
    select: { id: true, publishedAt: true },
  })

  if (!existing) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  if (existing.publishedAt) {
    return NextResponse.json(
      { error: 'Cannot update a published merit list' },
      { status: 400 },
    )
  }

  const body = (await req.json()) as Record<string, unknown>

  const allowedFields = [
    'name', 'totalSeats', 'cutoffScore', 'rankingCriteria', 'targetClassId',
  ] as const

  const data: Record<string, unknown> = {}
  for (const key of allowedFields) {
    if (key in body) {
      data[key] = body[key]
    }
  }

  const updated = await prisma.meritListConfig.update({
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

  const existing = await prisma.meritListConfig.findFirst({
    where: { id, institutionId },
    select: { id: true, publishedAt: true },
  })

  if (!existing) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  if (existing.publishedAt) {
    return NextResponse.json(
      { error: 'Cannot delete a published merit list' },
      { status: 400 },
    )
  }

  // Cascade: entries are deleted via onDelete: Cascade on the relation
  await prisma.meritListConfig.delete({ where: { id } })

  return NextResponse.json({ deleted: true })
}
