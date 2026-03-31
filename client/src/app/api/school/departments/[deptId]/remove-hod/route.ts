import { NextRequest, NextResponse } from 'next/server'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'

const json = NextResponse.json
type Ctx = { params: Promise<{ deptId: string }> }

export async function POST(req: NextRequest, { params }: Ctx) {
  const ctx = await getSchoolContext(req, ['ADMIN'])
  if (isApiError(ctx)) return ctx
  const { institutionId } = ctx
  const { deptId } = await params

  try {
    const dept = await prisma.department.findUnique({ where: { id: deptId } })
    if (!dept || dept.institutionId !== institutionId) {
      return json({ error: 'Department not found' }, { status: 404 })
    }

    const oldHodId = dept.hodId

    await prisma.department.update({
      where: { id: deptId },
      data: { hodId: null, hodSince: null },
    })

    if (oldHodId) {
      await prisma.staff.updateMany({
        where: { departmentId: deptId, reportsToId: oldHodId, institutionId },
        data: { reportsToId: null },
      })
    }

    return json({ ok: true })
  } catch (err) {
    console.error('POST /api/school/departments/[deptId]/remove-hod error:', err)
    return json({ error: 'Internal server error' }, { status: 500 })
  }
}
