import { NextResponse } from 'next/server'
import { auth } from '@/server/auth'
import { prisma } from '@/lib/prisma'

interface RouteContext {
  params: Promise<{ courseId: string }>
}

const MANAGEMENT_TYPES = ['ADMIN', 'TEACHER', 'INSTRUCTOR']

export async function GET(_req: Request, ctx: RouteContext) {
  const session = await auth()
  if (!session || !MANAGEMENT_TYPES.includes(session.user.portalType)) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const { courseId } = await ctx.params
  const institutionId = session.user.institutionId

  const course = await prisma.course.findFirst({
    where: { id: courseId, institutionId },
  })
  if (!course) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const enrollments = await prisma.courseEnrollment.findMany({
    where: { courseId },
    include: {
      student: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          admissionNo: true,
        },
      },
    },
    orderBy: { enrolledAt: 'desc' },
  })

  return NextResponse.json({
    enrollments: enrollments.map((e) => ({
      id: e.id,
      studentId: e.studentId,
      studentName: `${e.student.firstName} ${e.student.lastName}`,
      admissionNo: e.student.admissionNo,
      enrolledAt: e.enrolledAt,
      progressPercent: e.progressPercent,
      completedAt: e.completedAt,
    })),
  })
}
