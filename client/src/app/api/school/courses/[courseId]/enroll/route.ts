import { NextResponse } from 'next/server'
import { auth } from '@/server/auth'
import { prisma } from '@/lib/prisma'

interface RouteContext {
  params: Promise<{ courseId: string }>
}

export async function POST(_req: Request, ctx: RouteContext) {
  const session = await auth()
  if (!session || session.user.portalType !== 'STUDENT') {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const { courseId } = await ctx.params
  const institutionId = session.user.institutionId

  const student = await prisma.student.findFirst({
    where: { userId: session.user.id, institutionId, status: 'ACTIVE' },
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

export async function DELETE(_req: Request, ctx: RouteContext) {
  const session = await auth()
  if (!session || session.user.portalType !== 'STUDENT') {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const { courseId } = await ctx.params
  const institutionId = session.user.institutionId

  const student = await prisma.student.findFirst({
    where: { userId: session.user.id, institutionId },
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
