import { NextRequest, NextResponse } from 'next/server'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  const ctx = await getSchoolContext(req, ['ADMIN'])
    if (isApiError(ctx)) return ctx
    const { institutionId } = ctx

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
  const ctx = await getSchoolContext(req, ['ADMIN'])
    if (isApiError(ctx)) return ctx
    const { institutionId } = ctx

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
