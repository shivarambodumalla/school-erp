import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/server/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: { institutionId: string } }
) {
  const session = await auth()
  if (!session || session.user.portalType !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  try {
    const [users, breakdown] = await Promise.all([
      prisma.user.findMany({
        where: { institutionId: params.institutionId },
        select: {
          id: true, email: true, portalType: true,
          isActive: true, lastLoginAt: true, createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 200,
      }),
      prisma.user.groupBy({
        by: ['portalType'],
        where: { institutionId: params.institutionId },
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
