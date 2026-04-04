import { NextResponse } from 'next/server'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'
import {
  checkFeeCategoryNotInUse,
  DependencyError,
  handleDependencyError,
} from '@/lib/dependency-checks'

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

  // Support DEACTIVATE action via request body
  let body: { action?: string } = {}
  try {
    body = (await req.json()) as { action?: string }
  } catch {
    // No body is fine — default to hard delete
  }

  if (body.action === 'DEACTIVATE') {
    const updated = await prisma.feeCategory.update({
      where: { id },
      data: { isActive: false },
    })
    return NextResponse.json(updated)
  }

  try {
    // Block deletion if category has payment records
    await checkFeeCategoryNotInUse(id)
  } catch (err: unknown) {
    if (err instanceof DependencyError) return handleDependencyError(err)
    throw err
  }

  await prisma.feeCategory.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}