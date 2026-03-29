import { NextRequest, NextResponse } from 'next/server'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'

type Ctx = { params: Promise<{ staffId: string }> }

export async function GET(req: NextRequest,routeCtx: Ctx) {
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

  const card = await prisma.staffIdCard.findFirst({
    where: { staffId, isActive: true },
    orderBy: { issuedAt: 'desc' },
  })

  return NextResponse.json({ card })
}

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

  const body = (await req.json()) as {
    validTill: string
    fileUrl?: string
  }

  // Deactivate existing cards
  await prisma.staffIdCard.updateMany({
    where: { staffId, isActive: true },
    data: { isActive: false },
  })

  const card = await prisma.staffIdCard.create({
    data: {
      staffId,
      issuedById: ctx.userId,
      validTill: new Date(body.validTill),
      fileUrl: body.fileUrl ?? null,
      isActive: true,
    },
  })

  return NextResponse.json(card, { status: 201 })
}
