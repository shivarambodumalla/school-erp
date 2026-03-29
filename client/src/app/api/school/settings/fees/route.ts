import { NextResponse } from 'next/server'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  const ctx = await getSchoolContext(req, ['ADMIN'])
  if (isApiError(ctx)) return ctx
  const { institutionId } = ctx

  const settings = await prisma.feeSettings.upsert({
    where: { institutionId },
    create: { institutionId },
    update: {},
  })
  return NextResponse.json(settings)
}

export async function PATCH(req: Request) {
  const ctx = await getSchoolContext(req, ['ADMIN'])
  if (isApiError(ctx)) return ctx
  const { institutionId } = ctx

  const body = (await req.json()) as {
    receiptPrefix?: string
    receiptCurrentSeq?: number
    lateFineEnabled?: boolean
    reminderEnabled?: boolean
    partialPaymentAllowed?: boolean
  }

  const data: Record<string, unknown> = {}
  if (body.receiptPrefix !== undefined) data.receiptPrefix = body.receiptPrefix
  if (body.receiptCurrentSeq !== undefined) data.receiptCurrentSeq = body.receiptCurrentSeq
  if (body.lateFineEnabled !== undefined) data.lateFineEnabled = body.lateFineEnabled
  if (body.reminderEnabled !== undefined) data.reminderEnabled = body.reminderEnabled
  if (body.partialPaymentAllowed !== undefined) data.partialPaymentAllowed = body.partialPaymentAllowed

  const updated = await prisma.feeSettings.update({ where: { institutionId }, data })
  return NextResponse.json(updated)
}