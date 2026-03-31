import { NextRequest, NextResponse } from 'next/server'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'

const json = NextResponse.json
type Ctx = { params: Promise<{ deptId: string }> }

export async function GET(req: NextRequest, { params }: Ctx) {
  const ctx = await getSchoolContext(req, ['ADMIN', 'TEACHER'])
  if (isApiError(ctx)) return ctx
  const { institutionId } = ctx
  const { deptId } = await params

  try {
    const staff = await prisma.staff.findMany({
      where: { departmentId: deptId, institutionId },
      include: {
        primaryRole: { select: { name: true } },
        reportsTo: { select: { firstName: true, lastName: true } },
      },
    })

    return json(staff)
  } catch (err) {
    console.error('GET /api/school/departments/[deptId]/staff error:', err)
    return json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest, { params }: Ctx) {
  const ctx = await getSchoolContext(req, ['ADMIN'])
  if (isApiError(ctx)) return ctx
  const { institutionId } = ctx
  const { deptId } = await params

  try {
    const { staffId } = await req.json() as { staffId: string }

    const staff = await prisma.staff.findFirst({
      where: { id: staffId, institutionId },
    })
    if (!staff) {
      return json({ error: 'Staff member not found in this institution' }, { status: 400 })
    }

    const dept = await prisma.department.findUnique({ where: { id: deptId } })

    await prisma.staff.update({
      where: { id: staffId },
      data: {
        departmentId: deptId,
        reportsToId: dept?.hodId ?? null,
      },
    })

    return json({ ok: true })
  } catch (err) {
    console.error('POST /api/school/departments/[deptId]/staff error:', err)
    return json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  const ctx = await getSchoolContext(req, ['ADMIN'])
  if (isApiError(ctx)) return ctx
  const { deptId } = await params
  void deptId

  try {
    const { staffId } = await req.json() as { staffId: string }

    await prisma.staff.update({
      where: { id: staffId },
      data: { departmentId: null, reportsToId: null },
    })

    return json({ ok: true })
  } catch (err) {
    console.error('DELETE /api/school/departments/[deptId]/staff error:', err)
    return json({ error: 'Internal server error' }, { status: 500 })
  }
}
