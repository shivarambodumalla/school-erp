import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/server/auth'
import { prisma } from '@/lib/prisma'

type Ctx = { params: Promise<{ staffId: string }> }

export async function GET(_req: NextRequest, ctx: Ctx) {
  const session = await auth()
  if (!session || session.user.portalType !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const institutionId = session.user.institutionId
  const { staffId } = await ctx.params

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

export async function POST(req: NextRequest, ctx: Ctx) {
  const session = await auth()
  if (!session || session.user.portalType !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const institutionId = session.user.institutionId
  const { staffId } = await ctx.params

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
      createdById: session.user.id,
    },
  })

  return NextResponse.json(note, { status: 201 })
}
