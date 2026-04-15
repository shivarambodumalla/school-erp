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

  const lead = await prisma.lead.findFirst({
    where: { id, institutionId },
    include: {
      label: true,
      targetClass: true,
      assignedTo: { select: { id: true, firstName: true, lastName: true } },
      followUps: {
        orderBy: { scheduledAt: 'desc' },
        include: {
          staff: { select: { id: true, firstName: true, lastName: true } },
        },
      },
    },
  })

  if (!lead) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json(lead)
}

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  const ctx = await getSchoolContext(req, ['ADMIN', 'TEACHER'])
  if (isApiError(ctx)) return ctx
  const { institutionId } = ctx
  const { id } = await params

  const existing = await prisma.lead.findFirst({
    where: { id, institutionId },
    select: { id: true },
  })

  if (!existing) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const body = (await req.json()) as Record<string, unknown>

  const allowedFields = [
    'name', 'phone', 'email', 'status', 'notes',
    'labelId', 'assignedToId', 'targetClassId', 'source',
  ] as const

  const data: Record<string, unknown> = {}
  for (const key of allowedFields) {
    if (key in body) {
      data[key] = body[key]
    }
  }

  const updated = await prisma.lead.update({
    where: { id },
    data,
  })

  return NextResponse.json(updated)
}

export async function DELETE(req: NextRequest, { params }: RouteContext) {
  const ctx = await getSchoolContext(req, ['ADMIN', 'TEACHER'])
  if (isApiError(ctx)) return ctx
  const { institutionId } = ctx
  const { id } = await params

  const existing = await prisma.lead.findFirst({
    where: { id, institutionId },
    select: { id: true },
  })

  if (!existing) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const updated = await prisma.lead.update({
    where: { id },
    data: { status: 'LOST' },
  })

  return NextResponse.json(updated)
}
