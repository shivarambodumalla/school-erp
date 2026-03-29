import { NextResponse } from 'next/server'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  const ctx = await getSchoolContext(req, ['ADMIN'])
    if (isApiError(ctx)) return ctx
    const { institutionId } = ctx

  try {
    const [users, breakdown] = await Promise.all([
      prisma.user.findMany({
        where: { institutionId },
        select: {
          id: true, email: true, portalType: true,
          isActive: true, lastLoginAt: true, createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 200,
      }),
      prisma.user.groupBy({
        by: ['portalType'],
        where: { institutionId },
        _count: true,
        _max: { lastLoginAt: true },
      }),
    ])

    return NextResponse.json({
      total: users.length,
      active: users.filter(u => u.isActive).length,
      inactive: users.filter(u => !u.isActive).length,
      breakdown: breakdown.map(b => ({
        portalType: b.portalType,
        _count: b._count,
        lastLogin: b._max.lastLoginAt?.toISOString() ?? null,
      })),
      users: users.map(u => ({
        ...u,
        lastLoginAt: u.lastLoginAt?.toISOString() ?? null,
        createdAt: u.createdAt.toISOString(),
      })),
    })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
