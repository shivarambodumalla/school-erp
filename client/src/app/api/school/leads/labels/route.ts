import { NextResponse } from 'next/server'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'
import { createLabelSchema } from '@/features/leads/schemas/leadSchema'

/** GET /api/school/leads/labels — list labels */
export async function GET(req: Request) {
  const ctx = await getSchoolContext(req, ['ADMIN'])
  if (isApiError(ctx)) return ctx
  const { institutionId } = ctx

  const labels = await prisma.leadLabel.findMany({
    where: { institutionId },
    include: { _count: { select: { leads: true } } },
    orderBy: { name: 'asc' },
  })

  return NextResponse.json(labels)
}

/** POST /api/school/leads/labels — create label */
export async function POST(req: Request) {
  const ctx = await getSchoolContext(req, ['ADMIN'])
  if (isApiError(ctx)) return ctx
  const { institutionId } = ctx

  const body: unknown = await req.json()
  const parsed = createLabelSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    )
  }

  const data = parsed.data

  // Check duplicate
  const existing = await prisma.leadLabel.findUnique({
    where: { institutionId_name: { institutionId, name: data.name.trim() } },
  })
  if (existing) {
    return NextResponse.json(
      { error: 'A label with this name already exists' },
      { status: 409 },
    )
  }

  const label = await prisma.leadLabel.create({
    data: {
      institutionId,
      name: data.name.trim(),
      color: data.color ?? '#6366f1',
    },
  })

  return NextResponse.json(label, { status: 201 })
}
