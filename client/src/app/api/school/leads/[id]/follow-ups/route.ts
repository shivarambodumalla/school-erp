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
    select: { id: true },
  })

  if (!lead) {
    return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
  }

  const followUps = await prisma.leadFollowUp.findMany({
    where: { leadId: id, institutionId },
    orderBy: { scheduledAt: 'desc' },
    include: {
      staff: { select: { id: true, firstName: true, lastName: true } },
    },
  })

  return NextResponse.json(followUps)
}

export async function POST(req: NextRequest, { params }: RouteContext) {
  const ctx = await getSchoolContext(req, ['ADMIN', 'TEACHER'])
  if (isApiError(ctx)) return ctx
  const { institutionId, userId } = ctx
  const { id } = await params

  const lead = await prisma.lead.findFirst({
    where: { id, institutionId },
    select: { id: true },
  })

  if (!lead) {
    return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
  }

  const staff = await prisma.staff.findFirst({
    where: { userId, institutionId },
    select: { id: true },
  })

  if (!staff) {
    return NextResponse.json(
      { error: 'Staff record not found for current user' },
      { status: 400 },
    )
  }

  const body = (await req.json()) as {
    channel: string
    scheduledAt: string
    notes?: string
  }

  if (!body.channel || !body.scheduledAt) {
    return NextResponse.json(
      { error: 'channel and scheduledAt are required' },
      { status: 400 },
    )
  }

  const followUp = await prisma.leadFollowUp.create({
    data: {
      leadId: id,
      institutionId,
      staffId: staff.id,
      channel: body.channel as 'CALL' | 'WHATSAPP' | 'EMAIL' | 'SMS',
      scheduledAt: new Date(body.scheduledAt),
      notes: body.notes ?? null,
    },
    include: {
      staff: { select: { id: true, firstName: true, lastName: true } },
    },
  })

  return NextResponse.json(followUp, { status: 201 })
}
