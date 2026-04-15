import { NextResponse } from 'next/server'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'
import { createLeadSchema } from '@/features/leads/schemas/leadSchema'
import type { Prisma } from '@prisma/client'

/** GET /api/school/leads — list with search, status, source, label, assignedTo, date range, pagination */
export async function GET(req: Request) {
  const ctx = await getSchoolContext(req, ['ADMIN'])
  if (isApiError(ctx)) return ctx
  const { institutionId } = ctx

  const url = new URL(req.url)
  const search = url.searchParams.get('search') ?? ''
  const status = url.searchParams.get('status')
  const source = url.searchParams.get('source')
  const labelId = url.searchParams.get('labelId')
  const assignedToId = url.searchParams.get('assignedToId')
  const from = url.searchParams.get('from')
  const to = url.searchParams.get('to')
  const page = Math.max(1, Number(url.searchParams.get('page') ?? '1'))
  const take = Math.min(100, Math.max(1, Number(url.searchParams.get('take') ?? '20')))
  const skip = (page - 1) * take

  const where: Prisma.LeadWhereInput = { institutionId }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ]
  }
  if (status) where.status = status as Prisma.EnumLeadStatusFilter
  if (source) where.source = source as Prisma.EnumLeadSourceFilter
  if (labelId) where.labelId = labelId
  if (assignedToId) where.assignedToId = assignedToId
  if (from || to) {
    where.createdAt = {}
    if (from) where.createdAt.gte = new Date(from)
    if (to) where.createdAt.lte = new Date(to)
  }

  const [leads, total, statusCounts] = await Promise.all([
    prisma.lead.findMany({
      where,
      include: {
        assignedTo: { select: { id: true, firstName: true, lastName: true } },
        label: { select: { id: true, name: true, color: true } },
        targetClass: { select: { id: true, name: true } },
        followUps: {
          orderBy: { scheduledAt: 'desc' },
          take: 1,
          select: { scheduledAt: true, completedAt: true, channel: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    }),
    prisma.lead.count({ where }),
    prisma.lead.groupBy({
      by: ['status'],
      where: { institutionId },
      _count: { id: true },
    }),
  ])

  const counts: Record<string, number> = {}
  for (const row of statusCounts) {
    counts[row.status] = row._count.id
  }

  return NextResponse.json({ leads, total, counts })
}

/** POST /api/school/leads — create a lead */
export async function POST(req: Request) {
  const ctx = await getSchoolContext(req, ['ADMIN'])
  if (isApiError(ctx)) return ctx
  const { institutionId } = ctx

  const body: unknown = await req.json()
  const parsed = createLeadSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    )
  }

  const data = parsed.data
  const lead = await prisma.lead.create({
    data: {
      institutionId,
      name: data.name.trim(),
      phone: data.phone.trim(),
      email: data.email?.trim() || null,
      source: data.source ?? 'WALK_IN',
      targetClassId: data.targetClassId || null,
      notes: data.notes?.trim() || null,
      assignedToId: data.assignedToId || null,
      labelId: data.labelId || null,
    },
  })

  return NextResponse.json(lead, { status: 201 })
}
