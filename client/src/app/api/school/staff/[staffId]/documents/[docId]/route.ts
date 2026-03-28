import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/server/auth'
import { prisma } from '@/lib/prisma'

type Ctx = { params: Promise<{ staffId: string; docId: string }> }

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const session = await auth()
  if (!session || session.user.portalType !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const institutionId = session.user.institutionId
  const { staffId, docId } = await ctx.params

  const doc = await prisma.staffDocument.findFirst({
    where: { id: docId, staffId, institutionId },
  })
  if (!doc) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const body = (await req.json()) as {
    isVerified?: boolean
    notes?: string
  }

  const data: Record<string, unknown> = {}
  if ('isVerified' in body) {
    data.isVerified = body.isVerified
    if (body.isVerified) {
      data.verifiedById = session.user.id
      data.verifiedAt = new Date()
    }
  }
  if ('notes' in body) data.notes = body.notes

  const updated = await prisma.staffDocument.update({
    where: { id: docId },
    data,
  })

  return NextResponse.json(updated)
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const session = await auth()
  if (!session || session.user.portalType !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const institutionId = session.user.institutionId
  const { staffId, docId } = await ctx.params

  const doc = await prisma.staffDocument.findFirst({
    where: { id: docId, staffId, institutionId },
  })
  if (!doc) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  await prisma.staffDocument.delete({ where: { id: docId } })

  return NextResponse.json({ ok: true })
}
