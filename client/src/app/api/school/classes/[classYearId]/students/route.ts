import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/server/auth'
import { prisma } from '@/lib/prisma'

type RouteContext = { params: Promise<{ classYearId: string }> }

export async function GET(
  req: NextRequest,
  context: RouteContext
) {
  const session = await auth()
  if (!session || session.user.portalType !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const institutionId = session.user.institutionId
  if (!institutionId) {
    return NextResponse.json({ error: 'No institution' }, { status: 400 })
  }

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
  const session = await auth()
  if (!session || session.user.portalType !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const institutionId = session.user.institutionId
  if (!institutionId) {
    return NextResponse.json({ error: 'No institution' }, { status: 400 })
  }

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

    const existing = await prisma.studentSection.findUnique({
      where: { studentId_classYearId: { studentId: body.studentId, classYearId } },
    })
    if (existing) {
      return NextResponse.json(
        { error: 'Student is already enrolled in this class year' },
        { status: 409 }
      )
    }

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
