import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/server/auth'
import { prisma } from '@/lib/prisma'

type Ctx = { params: Promise<{ roleId: string }> }
const json = NextResponse.json
const INCLUDE_COUNT = { _count: { select: { primaryStaff: true, assignments: true } } }

async function getSession() {
  const session = await auth()
  if (!session || session.user.portalType !== 'ADMIN') return null
  if (!session.user.institutionId) return null
  return session
}

export async function GET(_req: NextRequest, ctx: Ctx) {
  const session = await getSession()
  if (!session) return json({ error: 'Unauthorized' }, { status: 401 })

  const { roleId } = await ctx.params
  try {
    const role = await prisma.staffRole.findFirst({
      where: { id: roleId, institutionId: session.user.institutionId },
      include: INCLUDE_COUNT,
    })
    if (!role) return json({ error: 'Role not found' }, { status: 404 })

    return json({
      ...role,
      staffCount: role._count.primaryStaff + role._count.assignments,
    })
  } catch (err) {
    console.error('GET /api/school/staff-roles/[roleId]:', err)
    return json({ error: 'Internal server error' }, { status: 500 })
  }
}

interface PatchBody {
  name?: string
  description?: string
  permissions?: { feature: string; access: string; scope: string }[]
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const session = await getSession()
  if (!session) return json({ error: 'Unauthorized' }, { status: 401 })

  const institutionId = session.user.institutionId
  const { roleId } = await ctx.params

  try {
    const role = await prisma.staffRole.findFirst({
      where: { id: roleId, institutionId },
    })
    if (!role) return json({ error: 'Role not found' }, { status: 404 })
    if (role.isSystemRole) {
      return json({ error: 'System roles cannot be modified' }, { status: 403 })
    }

    const body = (await req.json()) as PatchBody
    const data: Record<string, unknown> = {}
    if (body.name !== undefined) data.name = body.name.trim()
    if (body.description !== undefined)
      data.description = body.description?.trim() || null
    if (body.permissions !== undefined) data.permissions = body.permissions

    const updated = await prisma.staffRole.update({
      where: { id: roleId },
      data,
      include: INCLUDE_COUNT,
    })
    return json(updated)
  } catch (err) {
    console.error('PATCH /api/school/staff-roles/[roleId]:', err)
    return json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const session = await getSession()
  if (!session) return json({ error: 'Unauthorized' }, { status: 401 })

  const institutionId = session.user.institutionId
  const { roleId } = await ctx.params

  try {
    const role = await prisma.staffRole.findFirst({
      where: { id: roleId, institutionId },
      include: INCLUDE_COUNT,
    })
    if (!role) return json({ error: 'Role not found' }, { status: 404 })
    if (role.isSystemRole) {
      return json({ error: 'System roles cannot be deleted' }, { status: 403 })
    }

    const staffCount = role._count.primaryStaff + role._count.assignments
    if (staffCount > 0) {
      return json(
        { error: 'Cannot delete a role with assigned staff' },
        { status: 400 }
      )
    }

    await prisma.staffRole.delete({ where: { id: roleId } })
    return json({ success: true })
  } catch (err) {
    console.error('DELETE /api/school/staff-roles/[roleId]:', err)
    return json({ error: 'Internal server error' }, { status: 500 })
  }
}
