import { NextResponse } from 'next/server'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const ctx = await getSchoolContext(req, ['ADMIN'])
  if (isApiError(ctx)) return ctx
  const { institutionId } = ctx
  const { id } = await params

  const body = (await req.json()) as Record<string, unknown>

  if (body.amount !== undefined) {
    const paidCount = await prisma.feePayment.count({
      where: { feeCategoryId: id, institutionId, status: 'PAID' },
    })
    if (paidCount > 0) {
      return NextResponse.json(
        { error: 'Cannot change amount — payments recorded' },
        { status: 400 }
      )
    }
  }

  const updated = await prisma.feeCategory.update({
    where: { id },
    data: body,
  })
  return NextResponse.json(updated)
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const ctx = await getSchoolContext(req, ['ADMIN'])
  if (isApiError(ctx)) return ctx
  const { id } = await params

  const count = await prisma.feePayment.count({ where: { feeCategoryId: id } })
  if (count > 0) {
    return NextResponse.json(
      { error: 'Cannot delete — payments exist' },
      { status: 400 }
    )
  }

  await prisma.feeCategory.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}