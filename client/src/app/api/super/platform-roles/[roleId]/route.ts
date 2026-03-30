import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/server/auth'
import { prisma } from '@/lib/prisma'
import type { MasqueradeMode } from '@prisma/client'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { roleId: string } }
) {
  const session = await auth()
  if (!session || session.user.portalType !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  try {
    const role = await prisma.platformRole.findUnique({
      where: { id: params.roleId },
      select: { isSystemRole: true },
    })

    if (!role) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 })
    }
    const body = await req.json()
    const data: {
      name?: string
      description?: string
      permissions?: string[]
      masqueradeMode?: MasqueradeMode
    } = {}

    if (typeof body.name === 'string') {
      if (role.isSystemRole) {
        return NextResponse.json(
          { error: 'System role names cannot be changed' },
          { status: 403 }
        )
      }
      data.name = body.name
    }
    if (typeof body.description === 'string') data.description = body.description
    if (Array.isArray(body.permissions)) data.permissions = body.permissions
    if (
      typeof body.masqueradeMode === 'string' &&
      ['READ_ONLY', 'FULL_ACCESS', 'DISABLED'].includes(body.masqueradeMode)
    ) {
      data.masqueradeMode = body.masqueradeMode as MasqueradeMode
    }

    const updated = await prisma.platformRole.update({
      where: { id: params.roleId },
      data,
      select: {
        id: true,
        name: true,
        description: true,
        permissions: true,
        masqueradeMode: true,
        isSystemRole: true,
        createdAt: true,
      },
    })

    return NextResponse.json({
      ...updated,
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
  { params }: { params: { roleId: string } }
) {
  const session = await auth()
  if (!session || session.user.portalType !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  try {
    const role = await prisma.platformRole.findUnique({
      where: { id: params.roleId },
      select: {
        isSystemRole: true,
        _count: { select: { users: true } },
      },
    })

    if (!role) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 })
    }
    if (role.isSystemRole) {
      return NextResponse.json(
        { error: 'Cannot delete system roles' },
        { status: 403 }
      )
    }
    if (role._count.users > 0) {
      return NextResponse.json(
        { error: 'Cannot delete role with assigned users' },
        { status: 400 }
      )
    }

    await prisma.platformRole.delete({
      where: { id: params.roleId },
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}