import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { auth } from '@/server/auth'

const MARKETING_LEAD_STATUSES = [
  'NEW',
  'CONTACTED',
  'DEMO_SCHEDULED',
  'CONVERTED',
  'REJECTED',
] as const

async function requireSuperAdmin(): Promise<NextResponse | null> {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  if (session.user.portalType !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  return null
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const denied = await requireSuperAdmin()
  if (denied) return denied

  const url = new URL(req.url)
  const status = url.searchParams.get('status')
  const search = url.searchParams.get('search') ?? ''
  const page = Math.max(1, parseInt(url.searchParams.get('page') ?? '1', 10))
  const take = Math.min(100, Math.max(1, parseInt(url.searchParams.get('take') ?? '50', 10)))

  const where: Record<string, unknown> = {}
  if (status && (MARKETING_LEAD_STATUSES as readonly string[]).includes(status)) {
    where.status = status
  }
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { schoolName: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search, mode: 'insensitive' } },
    ]
  }

  const [records, total, counts] = await Promise.all([
    prisma.marketingLead.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * take,
      take,
    }),
    prisma.marketingLead.count({ where }),
    prisma.marketingLead.groupBy({
      by: ['status'],
      _count: { status: true },
    }),
  ])

  const countsByStatus: Record<string, number> = {}
  for (const c of counts) countsByStatus[c.status] = c._count.status

  return NextResponse.json({ records, total, counts: countsByStatus })
}

const patchSchema = z.object({
  id: z.string().min(1),
  status: z.enum(MARKETING_LEAD_STATUSES).optional(),
  notes: z.string().max(4000).nullable().optional(),
})

export async function PATCH(req: NextRequest): Promise<NextResponse> {
  const denied = await requireSuperAdmin()
  if (denied) return denied

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    )
  }

  const { id, status, notes } = parsed.data
  const data: Record<string, unknown> = {}
  if (status) {
    data.status = status
    if (status === 'CONTACTED' || status === 'DEMO_SCHEDULED') {
      data.contactedAt = new Date()
    }
  }
  if (notes !== undefined) data.notes = notes

  const updated = await prisma.marketingLead.update({
    where: { id },
    data,
  })

  return NextResponse.json(updated)
}
