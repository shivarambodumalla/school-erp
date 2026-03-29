import { NextResponse } from 'next/server'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  const ctx = await getSchoolContext(req, ['ADMIN'])
    if (isApiError(ctx)) return ctx
    const { institutionId } = ctx

  const leaveTypes = await prisma.staffLeaveType.findMany({
    where: { institutionId },
    orderBy: { name: 'asc' },
  })

  return NextResponse.json(leaveTypes)
}

export async function POST(req: Request) {
  const ctx = await getSchoolContext(req, ['ADMIN'])
    if (isApiError(ctx)) return ctx
    const { institutionId } = ctx
  const body = (await req.json()) as {
    name: string
    shortName: string
    maxDaysPerYear: number
    carryForward: boolean
    isPaid: boolean
  }

  if (!body.name?.trim() || !body.shortName?.trim()) {
    return NextResponse.json(
      { error: 'Name and short name are required' },
      { status: 400 },
    )
  }

  const existing = await prisma.staffLeaveType.findUnique({
    where: {
      institutionId_name: { institutionId, name: body.name.trim() },
    },
  })
  if (existing) {
    return NextResponse.json(
      { error: 'A leave type with this name already exists' },
      { status: 409 },
    )
  }

  const created = await prisma.staffLeaveType.create({
    data: {
      institutionId,
      name: body.name.trim(),
      shortName: body.shortName.trim(),
      maxDaysPerYear: body.maxDaysPerYear ?? 12,
      carryForward: body.carryForward ?? false,
      isPaid: body.isPaid ?? true,
    },
  })

  return NextResponse.json(created, { status: 201 })
}
