import { NextRequest, NextResponse } from 'next/server'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'
import {
  checkStaffRoleNotInUse,
  handleDependencyError,
} from '@/lib/dependency-checks'

type Ctx = { params: Promise<{ roleId: string }> }
const json = NextResponse.json
const INCLUDE_COUNT = { _count: { select: { primaryStaff: true, assignments: true } } }

export async function GET(req: NextRequest, { params }: Ctx) {
  const ctx = await getSchoolContext(req, ['ADMIN'])
  if (isApiError(ctx)) return ctx
  const { institutionId } = ctx

  const { roleId } = await params
  try {
    const role = await prisma.staffRole.findFirst({
      where: { id: roleId, institutionId },
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

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const ctx = await getSchoolContext(req, ['ADMIN'])
  if (isApiError(ctx)) return ctx
  const { institutionId } = ctx

  const { roleId } = await params

  try {
    const role = await prisma.staffRole.findFirst({
      where: { id: roleId, institutionId },
    })
    if (!role) return json({ error: 'Role not found' }, { status: 404 })

    const body = (await req.json()) as PatchBody
    const data: Record<string, unknown> = {}
    if (body.name !== undefined) {
      if (role.isSystemRole) {
        return json({ error: 'System role names cannot be changed' }, { status: 403 })
      }
      data.name = body.name.trim()
    }
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

export async function DELETE(req: NextRequest, { params }: Ctx) {
  const ctx = await getSchoolContext(req, ['ADMIN'])
  if (isApiError(ctx)) return ctx
  const { institutionId } = ctx

  const { roleId } = await params

  try {
    const role = await prisma.staffRole.findFirst({
      where: { id: roleId, institutionId },
    })
    if (!role) return json({ error: 'Role not found' }, { status: 404 })
    if (role.isSystemRole) {
      return json({ error: 'System roles cannot be deleted' }, { status: 403 })
    }

    try {
      await checkStaffRoleNotInUse(roleId)
    } catch (e) {
      return handleDependencyError(e)
    }

    await prisma.staffRole.delete({ where: { id: roleId } })
    return json({ success: true })
  } catch (err) {
    console.error('DELETE /api/school/staff-roles/[roleId]:', err)
    return json({ error: 'Internal server error' }, { status: 500 })
  }
}
