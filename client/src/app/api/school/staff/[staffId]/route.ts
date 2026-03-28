import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/server/auth'
import { prisma } from '@/lib/prisma'

type Ctx = { params: Promise<{ staffId: string }> }

export async function GET(_req: NextRequest, ctx: Ctx) {
  const session = await auth()
  if (!session || session.user.portalType !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { staffId } = await ctx.params

  const staff = await prisma.staff.findUnique({
    where: { id: staffId },
    include: {
      user: { select: { id: true, email: true, lastLoginAt: true } },
      department: { select: { id: true, name: true } },
      primaryRole: { select: { id: true, name: true } },
      reportsTo: {
        select: { id: true, firstName: true, lastName: true, designation: true },
      },
      directReports: {
        select: { id: true, firstName: true, lastName: true, designation: true },
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
  if (staff.institutionId !== session.user.institutionId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  return NextResponse.json(staff)
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const session = await auth()
  if (!session || session.user.portalType !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const institutionId = session.user.institutionId
  const { staffId } = await ctx.params

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

  const updated = await prisma.staff.update({
    where: { id: staffId },
    data,
    select: { id: true, firstName: true, lastName: true },
  })

  return NextResponse.json(updated)
}
