import { NextRequest, NextResponse } from 'next/server'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'
import {
  checkStaffNotHOD,
  checkStaffNotClassTeacher,
  checkStaffNotPrimarySubjectTeacher,
  cascadeStaffDeactivation,
} from '@/lib/dependency-checks'

type Ctx = { params: Promise<{ staffId: string }> }

export async function GET(req: NextRequest,routeCtx: Ctx) {
  const ctx = await getSchoolContext(req, ['ADMIN'])
    if (isApiError(ctx)) return ctx
    const { institutionId } = ctx
  const { staffId } = await routeCtx.params
  const isNumeric = /^\d+$/.test(staffId)

  const staff = await prisma.staff.findFirst({
    where: isNumeric
      ? { serialNo: parseInt(staffId, 10), institutionId }
      : { id: staffId, institutionId },
    include: {
      user: { select: { id: true, email: true, lastLoginAt: true } },
      department: { select: { id: true, name: true } },
      primaryRole: { select: { id: true, name: true } },
      reportsTo: {
        select: { id: true, serialNo: true, firstName: true, lastName: true, designation: true },
      },
      directReports: {
        select: { id: true, serialNo: true, firstName: true, lastName: true, designation: true },
      },
      secondaryRoles: {
        include: { staffRole: { select: { id: true, name: true } } },
      },
      classTeaching: {
        include: {
          section: { select: { id: true, name: true } },
          academicYear: { select: { id: true, name: true } },
        },
      },
      subjectTeaching: {
        include: {
          subject: {
            select: {
              id: true,
              name: true,
              classYear: {
                select: {
                  id: true,
                  classTemplate: { select: { name: true } },
                },
              },
            },
          },
        },
      },
      _count: {
        select: {
          leaves: true,
          attendance: true,
          salary: true,
          documents: true,
        },
      },
    },
  })

  if (!staff) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  if (staff.institutionId !== institutionId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  return NextResponse.json(staff)
}

export async function PATCH(req: NextRequest,routeCtx: Ctx) {
  const ctx = await getSchoolContext(req, ['ADMIN'])
    if (isApiError(ctx)) return ctx
    const { institutionId } = ctx
  const { staffId } = await routeCtx.params

  const existing = await prisma.staff.findFirst({
    where: { id: staffId, institutionId },
    select: { id: true },
  })
  if (!existing) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const body = (await req.json()) as Record<string, unknown>
  const allowed = [
    'firstName', 'lastName', 'designation', 'phone', 'personalEmail',
    'qualification', 'specialization', 'departmentId', 'primaryRoleId',
    'reportsToId', 'status',
  ]

  const data: Record<string, unknown> = {}
  for (const key of allowed) {
    if (key in body) data[key] = body[key]
  }

  // Validate no circular hierarchy
  if (data.reportsToId && data.reportsToId === staffId) {
    return NextResponse.json(
      { error: 'Staff cannot report to themselves' },
      { status: 400 },
    )
  }

  if (data.reportsToId) {
    let currentId = data.reportsToId as string
    const visited = new Set<string>([staffId])
    while (currentId) {
      if (visited.has(currentId)) {
        return NextResponse.json(
          { error: 'Circular reporting hierarchy detected' },
          { status: 400 },
        )
      }
      visited.add(currentId)
      const parent = await prisma.staff.findUnique({
        where: { id: currentId },
        select: { reportsToId: true },
      })
      if (!parent?.reportsToId) break
      currentId = parent.reportsToId
    }
  }

  if (data.joiningDate) {
    data.joiningDate = new Date(data.joiningDate as string)
  }

  const newStatus = data.status as string | undefined

  // ── Deactivation / Termination flow ──
  if (newStatus === 'INACTIVE' || newStatus === 'TERMINATED') {
    const [hodResult, classTeacherResult, primaryTeacherResult] =
      await Promise.all([
        checkStaffNotHOD(staffId),
        checkStaffNotClassTeacher(staffId),
        checkStaffNotPrimarySubjectTeacher(staffId),
      ])

    const warnings: string[] = []
    if (hodResult.isHOD) {
      warnings.push(
        `HOD / Deputy HOD of: ${hodResult.departments.join(', ')}`,
      )
    }
    if (classTeacherResult.isClassTeacher) {
      warnings.push(
        `Class teacher of: ${classTeacherResult.sections.join(', ')}`,
      )
    }
    if (primaryTeacherResult.isPrimaryTeacher) {
      warnings.push(
        `Primary teacher for: ${primaryTeacherResult.subjects.join(', ')}`,
      )
    }

    const confirmCascade = (body as Record<string, unknown>).confirmCascade === true

    if (warnings.length > 0 && !confirmCascade) {
      return NextResponse.json({
        requiresConfirmation: true,
        warnings,
      })
    }

    // Confirmed or no warnings — run cascade then update status
    const cascadeResult = await cascadeStaffDeactivation(staffId, institutionId)

    const updated = await prisma.staff.update({
      where: { id: staffId },
      data,
      select: { id: true, firstName: true, lastName: true },
    })

    return NextResponse.json({ ok: true, ...updated, cascadeResult })
  }

  // ── Normal (non-deactivation) update ──
  const updated = await prisma.staff.update({
    where: { id: staffId },
    data,
    select: { id: true, firstName: true, lastName: true },
  })

  return NextResponse.json(updated)
}
