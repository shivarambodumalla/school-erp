import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/server/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session || session.user.portalType !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const institutionId = session.user.institutionId
  if (!institutionId) {
    return NextResponse.json({ error: 'No institution' }, { status: 400 })
  }

  try {
    const roles = await prisma.staffRole.findMany({
      where: { institutionId },
      include: {
        _count: { select: { primaryStaff: true, assignments: true } },
      },
      orderBy: [{ isSystemRole: 'desc' }, { name: 'asc' }],
    })

    return NextResponse.json(roles)
  } catch (err) {
    console.error('GET /api/school/staff-roles error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

interface CreateBody {
  name: string
  description?: string
  permissions: { feature: string; access: string; scope: string }[]
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session || session.user.portalType !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const institutionId = session.user.institutionId
  if (!institutionId) {
    return NextResponse.json({ error: 'No institution' }, { status: 400 })
  }

  try {
    const body = (await req.json()) as CreateBody
    const { name, description, permissions } = body

    if (!name?.trim()) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    const existing = await prisma.staffRole.findUnique({
      where: { institutionId_name: { institutionId, name: name.trim() } },
    })
    if (existing) {
      return NextResponse.json(
        { error: 'A role with this name already exists' },
        { status: 409 }
      )
    }

    const role = await prisma.staffRole.create({
      data: {
        institutionId,
        name: name.trim(),
        description: description?.trim() || null,
        isSystemRole: false,
        permissions: permissions ?? [],
      },
      include: {
        _count: { select: { primaryStaff: true, assignments: true } },
      },
    })

    return NextResponse.json(role, { status: 201 })
  } catch (err) {
    console.error('POST /api/school/staff-roles error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
