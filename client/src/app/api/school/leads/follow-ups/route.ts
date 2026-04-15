import { NextResponse } from 'next/server'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'
import { completeFollowUpSchema } from '@/features/leads/schemas/leadSchema'
import type { Prisma } from '@prisma/client'

/** GET /api/school/leads/follow-ups — list all follow-ups with filters */
export async function GET(req: Request) {
  const ctx = await getSchoolContext(req, ['ADMIN'])
  if (isApiError(ctx)) return ctx
  const { institutionId, userId } = ctx

  const url = new URL(req.url)
  const filter = url.searchParams.get('filter') // 'today' | 'overdue' | 'all'
  const page = Math.max(1, Number(url.searchParams.get('page') ?? '1'))
  const take = Math.min(100, Math.max(1, Number(url.searchParams.get('take') ?? '50')))
  const skip = (page - 1) * take

  const where: Prisma.LeadFollowUpWhereInput = { institutionId }

  // Find staff record for current user
  const staff = await prisma.staff.findFirst({
    where: { userId, institutionId },
    select: { id: true },
  })

  const now = new Date()
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000)

  if (filter === 'today' && staff) {
    where.staffId = staff.id
    where.scheduledAt = { gte: startOfDay, lt: endOfDay }
    where.completedAt = null
  } else if (filter === 'overdue') {
    where.scheduledAt = { lt: startOfDay }
    where.completedAt = null
  }

  const [followUps, total, todayCount, overdueCount] = await Promise.all([
    prisma.leadFollowUp.findMany({
      where,
      include: {
        lead: {
          select: {
            id: true,
            name: true,
            phone: true,
            status: true,
            targetClass: { select: { name: true } },
          },
        },
        staff: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { scheduledAt: 'asc' },
      skip,
      take,
    }),
    prisma.leadFollowUp.count({ where }),
    // Count today's for the current staff
    staff
      ? prisma.leadFollowUp.count({
          where: {
            institutionId,
            staffId: staff.id,
            scheduledAt: { gte: startOfDay, lt: endOfDay },
            completedAt: null,
          },
        })
      : Promise.resolve(0),
    // Count overdue
    prisma.leadFollowUp.count({
      where: {
        institutionId,
        scheduledAt: { lt: startOfDay },
        completedAt: null,
      },
    }),
  ])

  return NextResponse.json({ followUps, total, todayCount, overdueCount })
}

/** PATCH /api/school/leads/follow-ups — mark a follow-up as done */
export async function PATCH(req: Request) {
  const ctx = await getSchoolContext(req, ['ADMIN'])
  if (isApiError(ctx)) return ctx
  const { institutionId } = ctx

  const body = (await req.json()) as { id: string; outcome?: string }
  if (!body.id) {
    return NextResponse.json({ error: 'Follow-up ID required' }, { status: 400 })
  }

  const parsed = completeFollowUpSchema.safeParse({ outcome: body.outcome })
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    )
  }

  const existing = await prisma.leadFollowUp.findFirst({
    where: { id: body.id, institutionId },
  })
  if (!existing) {
    return NextResponse.json({ error: 'Follow-up not found' }, { status: 404 })
  }

  const updated = await prisma.leadFollowUp.update({
    where: { id: body.id },
    data: {
      completedAt: new Date(),
      outcome: parsed.data.outcome?.trim() || null,
    },
  })

  return NextResponse.json(updated)
}
