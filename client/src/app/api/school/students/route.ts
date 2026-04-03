import { NextRequest, NextResponse } from 'next/server'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const ctx = await getSchoolContext(req, ['ADMIN', 'TEACHER'])
  if (isApiError(ctx)) return ctx
  const { institutionId } = ctx

  try {
    const url = new URL(req.url)
    const search = url.searchParams.get('search') ?? ''
    const status = url.searchParams.get('status') ?? ''
    const classId = url.searchParams.get('classId') ?? ''
    const assigned = url.searchParams.get('assigned') ?? ''
    const page = Math.max(1, parseInt(url.searchParams.get('page') ?? '1', 10))
    const take = Math.min(100, Math.max(1, parseInt(url.searchParams.get('take') ?? '30', 10)))

    const where: Record<string, unknown> = { institutionId }

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { admissionNo: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (status) where.status = status

    if (assigned === 'true') {
      where.sections = { some: { status: 'ACTIVE' } }
    }
    if (assigned === 'false') {
      where.sections = { none: { status: 'ACTIVE' } }
    }

    if (classId) {
      where.sections = {
        some: {
          status: 'ACTIVE',
          section: { classYearId: classId },
        },
      }
    }

    const [students, total, totalActive, totalInactive, totalUnassigned, totalTransferred] =
      await Promise.all([
        prisma.student.findMany({
          where,
          select: {
            id: true,
            serialNo: true,
            firstName: true,
            lastName: true,
            admissionNo: true,
            rollNo: true,
            status: true,
            photoUrl: true,
            createdAt: true,
            sections: {
              where: { status: 'ACTIVE' },
              take: 1,
              select: {
                section: {
                  select: {
                    name: true,
                    classYear: {
                      select: {
                        classTemplate: { select: { name: true } },
                      },
                    },
                  },
                },
              },
            },
          },
          orderBy: { firstName: 'asc' },
          skip: (page - 1) * take,
          take,
        }),
        prisma.student.count({ where }),
        prisma.student.count({ where: { institutionId, status: 'ACTIVE' } }),
        prisma.student.count({ where: { institutionId, status: 'INACTIVE' } }),
        prisma.student.count({ where: { institutionId, sections: { none: { status: 'ACTIVE' } } } }),
        prisma.student.count({ where: { institutionId, status: 'TRANSFERRED' } }),
      ])

    const classYears = await prisma.classYear.findMany({
      where: { institutionId, status: 'ACTIVE' },
      select: {
        id: true,
        classTemplate: { select: { name: true } },
        academicYear: { select: { name: true } },
      },
      orderBy: { classTemplate: { gradeLevel: 'asc' } },
    })

    const classOptions = classYears.map((cy) => ({
      id: cy.id,
      name: cy.classTemplate.name,
      yearName: cy.academicYear.name,
    }))

    const mapped = students.map((s) => ({
      id: s.id,
      serialNo: s.serialNo,
      firstName: s.firstName,
      lastName: s.lastName,
      admissionNo: s.admissionNo,
      rollNo: s.rollNo,
      status: s.status,
      photoUrl: s.photoUrl,
      className: s.sections[0]?.section.classYear.classTemplate.name ?? null,
      sectionName: s.sections[0]?.section.name ?? null,
      isAssigned: s.sections.length > 0,
    }))

    return NextResponse.json({
      students: mapped,
      total,
      counts: { totalActive, totalInactive, totalUnassigned, totalTransferred },
      classOptions,
    })
  } catch (err) {
    console.error('GET /api/school/students error:', err)
    return NextResponse.json(
      { students: [], total: 0, counts: { totalActive: 0, totalInactive: 0, totalUnassigned: 0, totalTransferred: 0 }, classOptions: [] },
      { status: 500 },
    )
  }
}

export async function PATCH(req: NextRequest) {
  const ctx = await getSchoolContext(req, ['ADMIN'])
  if (isApiError(ctx)) return ctx
  const { institutionId } = ctx

  try {
    const body = (await req.json()) as { studentId: string; status: string }
    if (!body.studentId || !body.status) {
      return NextResponse.json({ error: 'studentId and status are required' }, { status: 400 })
    }

    const validStatuses = ['ACTIVE', 'INACTIVE', 'TRANSFERRED'] as const
    type ValidStatus = (typeof validStatuses)[number]
    if (!validStatuses.includes(body.status as ValidStatus)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const student = await prisma.student.findFirst({
      where: { id: body.studentId, institutionId },
    })
    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })
    }

    const updated = await prisma.student.update({
      where: { id: body.studentId },
      data: { status: body.status as ValidStatus },
      select: { id: true, status: true },
    })

    return NextResponse.json(updated)
  } catch (err) {
    console.error('PATCH /api/school/students error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
