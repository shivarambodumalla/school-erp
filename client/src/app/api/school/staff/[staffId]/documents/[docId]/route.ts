import { NextRequest, NextResponse } from 'next/server'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'

type Ctx = { params: Promise<{ staffId: string; docId: string }> }

export async function PATCH(req: NextRequest,routeCtx: Ctx) {
  const ctx = await getSchoolContext(req, ['ADMIN'])
    if (isApiError(ctx)) return ctx
    const { institutionId } = ctx
  const { staffId, docId } = await routeCtx.params

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
      data.verifiedById = ctx.userId
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

export async function DELETE(req: NextRequest,routeCtx: Ctx) {
  const ctx = await getSchoolContext(req, ['ADMIN'])
    if (isApiError(ctx)) return ctx
    const { institutionId } = ctx
  const { staffId, docId } = await routeCtx.params

  const doc = await prisma.staffDocument.findFirst({
    where: { id: docId, staffId, institutionId },
  })
  if (!doc) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  await prisma.staffDocument.delete({ where: { id: docId } })

  return NextResponse.json({ ok: true })
}
