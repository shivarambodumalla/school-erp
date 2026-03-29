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

  const notes = await prisma.performanceNote.findMany({
    where: { staffId, institutionId },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ notes })
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
    note: string
    rating?: number
    isPrivate?: boolean
  }

  const note = await prisma.performanceNote.create({
    data: {
      institutionId,
      staffId,
      note: body.note,
      rating: body.rating ?? null,
      isPrivate: body.isPrivate ?? true,
      createdById: ctx.userId,
    },
  })

  return NextResponse.json(note, { status: 201 })
}
