import { NextResponse } from 'next/server'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'

interface RouteContext {
  params: Promise<{ courseId: string }>
}

export async function POST(req: Request,routeCtx: RouteContext) {
  const ctx = await getSchoolContext(req, ['STUDENT'])
    if (isApiError(ctx)) return ctx
    const { institutionId } = ctx

  const { courseId } = await routeCtx.params

  const student = await prisma.student.findFirst({
    where: { userId: ctx.userId, institutionId, status: 'ACTIVE' },
  })
  if (!student) {
    return NextResponse.json({ error: 'Student not found' }, { status: 404 })
  }

  const course = await prisma.course.findFirst({
    where: { id: courseId, institutionId, status: 'ACTIVE' },
    include: { _count: { select: { enrollments: true } } },
  })
  if (!course) {
    return NextResponse.json({ error: 'Course not available' }, { status: 404 })
  }

  const now = new Date()
  if (course.enrollmentStart && now < course.enrollmentStart) {
    return NextResponse.json({ error: 'Enrollment not open' }, { status: 400 })
  }
  if (course.enrollmentEnd && now > course.enrollmentEnd) {
    return NextResponse.json({ error: 'Enrollment closed' }, { status: 400 })
  }
  if (course.maxEnrollment && course._count.enrollments >= course.maxEnrollment) {
    return NextResponse.json({ error: 'Course is full' }, { status: 400 })
  }

  const enrollment = await prisma.courseEnrollment.create({
    data: { courseId, studentId: student.id },
  })

  return NextResponse.json(enrollment, { status: 201 })
}

export async function DELETE(req: Request,routeCtx: RouteContext) {
  const ctx = await getSchoolContext(req, ['STUDENT'])
    if (isApiError(ctx)) return ctx
    const { institutionId } = ctx

  const { courseId } = await routeCtx.params

  const student = await prisma.student.findFirst({
    where: { userId: ctx.userId, institutionId },
  })
  if (!student) {
    return NextResponse.json({ error: 'Student not found' }, { status: 404 })
  }

  await prisma.courseEnrollment.delete({
    where: {
      courseId_studentId: { courseId, studentId: student.id },
    },
  })

  return NextResponse.json({ unenrolled: true })
}
