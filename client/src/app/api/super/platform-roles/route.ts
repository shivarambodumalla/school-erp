import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/server/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import type { MasqueradeMode } from '@prisma/client'

const createRoleSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  permissions: z.array(z.string()),
  masqueradeMode: z.enum(['READ_ONLY', 'FULL_ACCESS', 'DISABLED']),
})

export async function GET() {
  const session = await auth()
  if (!session || session.user.portalType !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  try {
    const roles = await prisma.platformRole.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        permissions: true,
        masqueradeMode: true,
        isSystemRole: true,
        createdAt: true,
        _count: { select: { users: true } },
      },
      orderBy: { createdAt: 'asc' },
    })

    return NextResponse.json({
      roles: roles.map((r) => ({
        ...r,
        createdAt: r.createdAt.toISOString(),
      })),
    })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session || session.user.portalType !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const parsed = createRoleSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.issues },
        { status: 400 }
      )
    }

    const { name, description, permissions, masqueradeMode } = parsed.data

    const existing = await prisma.platformRole.findUnique({
      where: { name },
      select: { id: true },
    })
    if (existing) {
      return NextResponse.json(
        { error: 'Role name already taken' },
        { status: 409 }
      )
    }

    const role = await prisma.platformRole.create({
      data: {
        name,
        description,
        permissions,
        masqueradeMode: masqueradeMode as MasqueradeMode,
      },
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

    return NextResponse.json(
      { ...role, createdAt: role.createdAt.toISOString() },
      { status: 201 }
    )
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}