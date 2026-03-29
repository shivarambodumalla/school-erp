import { NextResponse } from 'next/server'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  const ctx = await getSchoolContext(req, ['ADMIN'])
  if (isApiError(ctx)) return ctx
  const { institutionId } = ctx

  const fines = await prisma.feeFine.findMany({
    where: { institutionId, isActive: true },
    orderBy: { name: 'asc' },
  })
  return NextResponse.json(fines)
}

export async function POST(req: Request) {
  const ctx = await getSchoolContext(req, ['ADMIN'])
  if (isApiError(ctx)) return ctx
  const { institutionId } = ctx

  const body = (await req.json()) as {
    name: string; feeCategoryId?: string
    type?: string; amount: number
    graceDays?: number; maxAmount?: number
  }

  const fine = await prisma.feeFine.create({
    data: {
      institutionId,
      name: body.name,
      feeCategoryId: body.feeCategoryId ?? null,
      type: (body.type as 'FIXED') ?? 'FIXED',
      amount: body.amount,
      graceDays: body.graceDays ?? 0,
      maxAmount: body.maxAmount ?? null,
    },
  })
  return NextResponse.json(fine, { status: 201 })
}