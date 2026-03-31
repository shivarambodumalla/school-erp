import { NextRequest, NextResponse } from 'next/server'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'

const json = NextResponse.json

export async function GET(req: NextRequest) {
  const ctx = await getSchoolContext(req, ['ADMIN', 'TEACHER'])
  if (isApiError(ctx)) return ctx
  const { institutionId } = ctx

  try {
    const departments = await prisma.department.findMany({
      where: { institutionId },
      include: {
        hod: {
          select: {
            id: true, firstName: true, lastName: true, designation: true,
            user: { select: { email: true } },
          },
        },
        deputyHod: {
          select: { id: true, firstName: true, lastName: true, designation: true },
        },
        _count: { select: { staff: true, announcements: true } },
      },
      orderBy: { name: 'asc' },
    })

    return json(departments)
  } catch (err) {
    console.error('GET /api/school/departments error:', err)
    return json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const ctx = await getSchoolContext(req, ['ADMIN'])
  if (isApiError(ctx)) return ctx
  const { institutionId } = ctx

  try {
    const body = await req.json() as {
      name: string; hodId: string; deputyHodId?: string
      description?: string; color?: string; avatarUrl?: string
      subjectNames?: string[]; status?: string
    }

    if (!body.name || body.name.trim().length < 2) {
      return json({ error: 'Name must be at least 2 characters' }, { status: 400 })
    }

    const existing = await prisma.department.findUnique({
      where: { institutionId_name: { institutionId, name: body.name.trim() } },
    })
    if (existing) {
      return json({ error: 'A department with this name already exists' }, { status: 409 })
    }

    const hod = await prisma.staff.findFirst({
      where: { id: body.hodId, institutionId },
    })
    if (!hod) {
      return json({ error: 'Invalid HOD staff member' }, { status: 400 })
    }

    if (body.deputyHodId) {
      const deputy = await prisma.staff.findFirst({
        where: { id: body.deputyHodId, institutionId },
      })
      if (!deputy) {
        return json({ error: 'Invalid Deputy HOD staff member' }, { status: 400 })
      }
    }

    const department = await prisma.department.create({
      data: {
        institutionId,
        name: body.name.trim(),
        description: body.description ?? null,
        color: body.color ?? '#6366f1',
        avatarUrl: body.avatarUrl ?? null,
        subjectNames: body.subjectNames ?? [],
        status: (body.status as 'ACTIVE' | 'INACTIVE') ?? 'ACTIVE',
        hodId: body.hodId,
        deputyHodId: body.deputyHodId ?? null,
        hodSince: new Date(),
      },
      include: {
        hod: {
          select: {
            id: true, firstName: true, lastName: true, designation: true,
            user: { select: { email: true } },
          },
        },
        deputyHod: {
          select: { id: true, firstName: true, lastName: true, designation: true },
        },
        _count: { select: { staff: true, announcements: true } },
      },
    })

    const staffUpdates = [
      prisma.staff.update({ where: { id: body.hodId }, data: { departmentId: department.id } }),
    ]
    if (body.deputyHodId) {
      staffUpdates.push(
        prisma.staff.update({ where: { id: body.deputyHodId }, data: { departmentId: department.id } }),
      )
    }
    await Promise.all(staffUpdates)

    return json(department, { status: 201 })
  } catch (err) {
    console.error('POST /api/school/departments error:', err)
    return json({ error: 'Internal server error' }, { status: 500 })
  }
}
