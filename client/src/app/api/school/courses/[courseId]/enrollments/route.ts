import { NextResponse } from 'next/server'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'

interface RouteContext {
  params: Promise<{ courseId: string }>
}


export async function GET(req: Request,routeCtx: RouteContext) {
  const ctx = await getSchoolContext(req, ['ADMIN', 'TEACHER', 'INSTRUCTOR'])
    if (isApiError(ctx)) return ctx
    const { institutionId } = ctx

  const { courseId } = await routeCtx.params

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
