import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/server/auth'
import { prisma } from '@/lib/prisma'
import type { PlanTier } from '@prisma/client'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session || session.user.portalType !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') ?? undefined
    const plan = searchParams.get('plan') ?? undefined
    const status = searchParams.get('status') ?? undefined
    const page = Math.max(1, Number(searchParams.get('page') ?? '1'))
    const pageSize = 20

    const where = {
      AND: [
        search
          ? {
              OR: [
                { name: { contains: search, mode: 'insensitive' as const } },
                { subdomain: { contains: search, mode: 'insensitive' as const } },
              ],
            }
          : {},
        plan ? { planTier: plan as PlanTier } : {},
        status === 'active'
          ? { isActive: true }
          : status === 'suspended'
            ? { isActive: false }
            : {},
      ],
    }

    const [institutions, total] = await Promise.all([
      prisma.institution.findMany({
        where,
        select: {
          id: true,
          name: true,
          subdomain: true,
          board: true,
          planTier: true,
          isActive: true,
          suspendedAt: true,
          createdAt: true,
          primaryColor: true,
          logoUrl: true,
          _count: { select: { students: true, users: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.institution.count({ where }),
    ])

    return NextResponse.json({
      institutions: institutions.map((inst) => ({
        ...inst,
        createdAt: inst.createdAt.toISOString(),
        suspendedAt: inst.suspendedAt?.toISOString() ?? null,
      })),
      total,
      page,
      totalPages: Math.ceil(total / pageSize),
    })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}