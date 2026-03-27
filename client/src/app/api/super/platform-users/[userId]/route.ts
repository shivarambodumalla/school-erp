import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/server/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  const session = await auth()
  if (!session || session.user.portalType !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const data: { platformRoleId?: string; isActive?: boolean } = {}

    if (typeof body.platformRoleId === 'string') {
      data.platformRoleId = body.platformRoleId
    }
    if (typeof body.isActive === 'boolean') {
      data.isActive = body.isActive
    }

    const updated = await prisma.platformUser.update({
      where: { id: params.userId },
      data,
      select: {
        id: true,
        email: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        platformRole: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json({
      ...updated,
      lastLoginAt: updated.lastLoginAt?.toISOString() ?? null,
      createdAt: updated.createdAt.toISOString(),
    })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { userId: string } }
) {
  const session = await auth()
  if (!session || session.user.portalType !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  if (session.user.id === params.userId) {
    return NextResponse.json(
      { error: 'Cannot deactivate yourself' },
      { status: 400 }
    )
  }

  try {
    await prisma.platformUser.update({
      where: { id: params.userId },
      data: { isActive: false },
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}