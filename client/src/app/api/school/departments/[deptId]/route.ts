import { NextRequest, NextResponse } from 'next/server'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'
import {
  checkDeptHasNoStaff,
  checkDeptHasNoSubjects,
  handleDependencyError,
} from '@/lib/dependency-checks'

const json = NextResponse.json
type Ctx = { params: Promise<{ deptId: string }> }

export async function GET(req: NextRequest, { params }: Ctx) {
  const ctx = await getSchoolContext(req, ['ADMIN', 'TEACHER'])
  if (isApiError(ctx)) return ctx
  const { institutionId } = ctx
  const { deptId } = await params

  try {
    const dept = await prisma.department.findUnique({
      where: { id: deptId },
      include: {
        hod: { include: { user: { select: { email: true } } } },
        deputyHod: { include: { user: { select: { email: true } } } },
        staff: {
          include: {
            primaryRole: { select: { name: true } },
            reportsTo: { select: { firstName: true, lastName: true } },
          },
        },
        announcements: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: { createdBy: { select: { email: true } } },
        },
        _count: { select: { staff: true, announcements: true } },
      },
    })

    if (!dept || dept.institutionId !== institutionId) {
      return json({ error: 'Department not found' }, { status: 404 })
    }

    return json(dept)
  } catch (err) {
    console.error('GET /api/school/departments/[deptId] error:', err)
    return json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const ctx = await getSchoolContext(req, ['ADMIN', 'TEACHER'])
  if (isApiError(ctx)) return ctx
  const { institutionId, portalType, userId } = ctx
  const { deptId } = await params

  try {
    const dept = await prisma.department.findUnique({ where: { id: deptId } })
    if (!dept || dept.institutionId !== institutionId) {
      return json({ error: 'Department not found' }, { status: 404 })
    }

    const body = await req.json() as Record<string, unknown>

    if (portalType === 'TEACHER') {
      const staff = await prisma.staff.findFirst({
        where: { userId, institutionId },
      })
      if (!staff || staff.id !== dept.hodId) {
        return json({ error: 'Only the HOD can edit this department' }, { status: 403 })
      }
      const allowed: Record<string, unknown> = {}
      if (body.description !== undefined) allowed.description = body.description
      if (body.subjectNames !== undefined) allowed.subjectNames = body.subjectNames
      const updated = await prisma.department.update({
        where: { id: deptId },
        data: allowed,
      })
      return json(updated)
    }

    // ADMIN — allow all fields
    const data: Record<string, unknown> = {}
    const fields = ['name', 'description', 'color', 'avatarUrl', 'status', 'hodId', 'deputyHodId', 'subjectNames']
    for (const f of fields) {
      if (body[f] !== undefined) data[f] = body[f]
    }
    if (data.hodId && data.hodId !== dept.hodId) {
      data.hodSince = new Date()
    }

    const updated = await prisma.department.update({
      where: { id: deptId },
      data,
    })

    return json(updated)
  } catch (err) {
    console.error('PATCH /api/school/departments/[deptId] error:', err)
    return json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  const ctx = await getSchoolContext(req, ['ADMIN'])
  if (isApiError(ctx)) return ctx
  const { institutionId } = ctx
  const { deptId } = await params

  try {
    const dept = await prisma.department.findUnique({
      where: { id: deptId },
    })
    if (!dept || dept.institutionId !== institutionId) {
      return json({ error: 'Department not found' }, { status: 404 })
    }

    try {
      await checkDeptHasNoStaff(deptId)
      await checkDeptHasNoSubjects(deptId)
    } catch (e) {
      return handleDependencyError(e)
    }

    await prisma.department.delete({ where: { id: deptId } })
    return json({ ok: true })
  } catch (err) {
    console.error('DELETE /api/school/departments/[deptId] error:', err)
    return json({ error: 'Internal server error' }, { status: 500 })
  }
}
