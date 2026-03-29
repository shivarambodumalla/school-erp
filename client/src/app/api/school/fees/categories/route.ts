import { NextResponse } from 'next/server'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  const ctx = await getSchoolContext(req, ['ADMIN'])
  if (isApiError(ctx)) return ctx
  const { institutionId } = ctx

  const categories = await prisma.feeCategory.findMany({
    where: { institutionId },
    include: { _count: { select: { payments: true } } },
    orderBy: { order: 'asc' },
  })
  return NextResponse.json(categories)
}

export async function POST(req: Request) {
  const ctx = await getSchoolContext(req, ['ADMIN'])
  if (isApiError(ctx)) return ctx
  const { institutionId } = ctx

  const body = (await req.json()) as {
    name: string; amount: number; frequency: string
    isOptional?: boolean; applicableTo?: string
    classYearIds?: string[]; sectionIds?: string[]
    description?: string
  }

  if (!body.name?.trim() || !body.amount) {
    return NextResponse.json({ error: 'Name and amount are required' }, { status: 400 })
  }

  const existing = await prisma.feeCategory.findUnique({
    where: { institutionId_name: { institutionId, name: body.name.trim() } },
  })
  if (existing) {
    return NextResponse.json({ error: 'Category with this name already exists' }, { status: 409 })
  }

  const cat = await prisma.feeCategory.create({
    data: {
      institutionId,
      name: body.name.trim(),
      amount: body.amount,
      frequency: (body.frequency as 'MONTHLY') ?? 'MONTHLY',
      isOptional: body.isOptional ?? false,
      applicableTo: (body.applicableTo as 'ALL') ?? 'ALL',
      classYearIds: body.classYearIds ?? [],
      sectionIds: body.sectionIds ?? [],
      description: body.description ?? null,
    },
  })
  return NextResponse.json(cat, { status: 201 })
}