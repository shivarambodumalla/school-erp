import { NextRequest, NextResponse } from 'next/server'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'
import {
  checkClassYearIsActive,
  checkSectionCapacity,
  checkStudentNotDuplicateEnrollment,
  handleDependencyError,
} from '@/lib/dependency-checks'

type RouteContext = { params: Promise<{ classYearId: string }> }

export async function GET(
  req: NextRequest,
  context: RouteContext
) {
  const ctx = await getSchoolContext(req, ['ADMIN'])
    if (isApiError(ctx)) return ctx
    const { institutionId } = ctx

  try {
    const { classYearId } = await context.params
    const url = new URL(req.url)
    const sectionId = url.searchParams.get('sectionId')

    const classYear = await prisma.classYear.findFirst({
      where: { id: classYearId, institutionId },
    })
    if (!classYear) {
      return NextResponse.json({ error: 'Class year not found' }, { status: 404 })
    }

    const where: Record<string, unknown> = { classYearId, institutionId }
    if (sectionId) {
      where.sectionId = sectionId
    }

    const studentSections = await prisma.studentSection.findMany({
      where,
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            admissionNo: true,
            rollNo: true,
            photoUrl: true,
            serialNo: true,
          },
        },
        section: { select: { id: true, name: true } },
      },
      orderBy: { student: { firstName: 'asc' } },
    })

    const result = studentSections.map((ss) => ({
      student: ss.student,
      sectionId: ss.section.id,
      sectionName: ss.section.name,
      status: ss.status,
    }))

    return NextResponse.json(result)
  } catch (err) {
    console.error('GET /api/school/classes/[classYearId]/students error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  req: NextRequest,
  context: RouteContext
) {
  const ctx = await getSchoolContext(req, ['ADMIN'])
    if (isApiError(ctx)) return ctx
    const { institutionId } = ctx

  try {
    const { classYearId } = await context.params
    const body = await req.json() as { studentId: string; sectionId: string }

    if (!body.studentId || !body.sectionId) {
      return NextResponse.json(
        { error: 'studentId and sectionId are required' },
        { status: 400 }
      )
    }

    const classYear = await prisma.classYear.findFirst({
      where: { id: classYearId, institutionId },
    })
    if (!classYear) {
      return NextResponse.json({ error: 'Class year not found' }, { status: 404 })
    }

    try {
      await checkClassYearIsActive(classYearId)
      await checkSectionCapacity(body.sectionId)
      await checkStudentNotDuplicateEnrollment(body.studentId, classYearId)
    } catch (e) { return handleDependencyError(e) }

    const studentSection = await prisma.studentSection.create({
      data: {
        institutionId,
        studentId: body.studentId,
        sectionId: body.sectionId,
        classYearId,
      },
    })

    return NextResponse.json(studentSection, { status: 201 })
  } catch (err) {
    console.error('POST /api/school/classes/[classYearId]/students error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
