import { NextResponse } from 'next/server'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  const ctx = await getSchoolContext(req, ['ADMIN'])
    if (isApiError(ctx)) return ctx
    const { institutionId } = ctx

  const departments = await prisma.department.findMany({
    where: { institutionId },
    include: { _count: { select: { staff: true } } },
    orderBy: { name: 'asc' },
  })

  return NextResponse.json(departments)
}

export async function POST(req: Request) {
  const ctx = await getSchoolContext(req, ['ADMIN'])
    if (isApiError(ctx)) return ctx
    const { institutionId } = ctx
  const body = (await req.json()) as {
    name: string
    description?: string
  }

  if (!body.name?.trim()) {
    return NextResponse.json(
      { error: 'Name is required' },
      { status: 400 },
    )
  }

  const existing = await prisma.department.findUnique({
    where: { institutionId_name: { institutionId, name: body.name.trim() } },
  })
  if (existing) {
    return NextResponse.json(
      { error: 'A department with this name already exists' },
      { status: 409 },
    )
  }

  const created = await prisma.department.create({
    data: {
      institutionId,
      name: body.name.trim(),
      description: body.description?.trim() || null,
    },
  })

  return NextResponse.json(created, { status: 201 })
}
