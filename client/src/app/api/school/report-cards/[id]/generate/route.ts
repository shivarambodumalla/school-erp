import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function POST(req: NextRequest, { params }: RouteContext) {
  const ctx = await getSchoolContext(req, ['ADMIN'])
  if (isApiError(ctx)) return ctx
  const { institutionId } = ctx
  const { id } = await params

  const generation = await prisma.reportCardGeneration.findFirst({
    where: { id, institutionId },
    select: { id: true, classYearId: true, status: true },
  })

  if (!generation) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  if (generation.status === 'PUBLISHED') {
    return NextResponse.json(
      { error: 'Cannot regenerate a published report card' },
      { status: 400 },
    )
  }

  // Find all students enrolled in sections of this classYear
  const studentSections = await prisma.studentSection.findMany({
    where: {
      classYearId: generation.classYearId,
      institutionId,
      status: 'ACTIVE',
    },
    select: { studentId: true },
    distinct: ['studentId'],
  })

  if (studentSections.length === 0) {
    return NextResponse.json(
      { error: 'No students found in this class year' },
      { status: 400 },
    )
  }

  // Delete existing cards for this generation (regenerate)
  await prisma.reportCard.deleteMany({
    where: { generationId: id },
  })

  // Create a report card record for each student
  const cards = studentSections.map((ss) => ({
    generationId: id,
    studentId: ss.studentId,
  }))

  await prisma.reportCard.createMany({ data: cards })

  // Update generation status
  await prisma.reportCardGeneration.update({
    where: { id },
    data: {
      status: 'GENERATED',
      generatedAt: new Date(),
    },
  })

  const created = await prisma.reportCard.findMany({
    where: { generationId: id },
    include: {
      student: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          rollNo: true,
          admissionNo: true,
        },
      },
    },
    orderBy: { student: { firstName: 'asc' } },
  })

  return NextResponse.json(created)
}
