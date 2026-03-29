import { NextRequest, NextResponse } from 'next/server'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'

interface RouteContext {
  params: Promise<{ courseId: string }>
}

export async function GET(req: NextRequest, { params }: RouteContext) {
  const ctx = await getSchoolContext(req, ['ADMIN', 'TEACHER', 'STUDENT'])
  if (isApiError(ctx)) return ctx
  const { institutionId } = ctx

  const { courseId } = await params

  const course = await prisma.course.findFirst({
    where: { id: courseId, institutionId },
    include: {
      posts: {
        include: { attachments: true },
        orderBy: { order: 'asc' },
      },
      _count: { select: { enrollments: true } },
    },
  })
  if (!course) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  let enrollment = null
  if (ctx.portalType === 'STUDENT') {
    const student = await prisma.student.findFirst({
      where: { userId: ctx.userId, institutionId },
    })
    if (student) {
      enrollment = await prisma.courseEnrollment.findUnique({
        where: {
          courseId_studentId: { courseId, studentId: student.id },
        },
      })
    }
  }

  return NextResponse.json({ ...course, enrollment })
}

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  const ctx = await getSchoolContext(req, ['ADMIN', 'TEACHER'])
  if (isApiError(ctx)) return ctx
  const { institutionId } = ctx

  const { courseId } = await params
  const body = (await req.json()) as Record<string, unknown>

  const updated = await prisma.course.update({
    where: { id: courseId, institutionId },
    data: body,
  })

  return NextResponse.json(updated)
}

export async function DELETE(req: NextRequest, { params }: RouteContext) {
  const ctx = await getSchoolContext(req, ['ADMIN'])
  if (isApiError(ctx)) return ctx
  const { institutionId } = ctx

  const { courseId } = await params

  const count = await prisma.courseEnrollment.count({
    where: { courseId },
  })
  if (count > 0) {
    return NextResponse.json(
      { error: 'Cannot delete course with enrollments' },
      { status: 400 },
    )
  }

  await prisma.courseAttachment.deleteMany({
    where: { coursePost: { courseId } },
  })
  await prisma.coursePost.deleteMany({ where: { courseId } })
  await prisma.course.delete({
    where: { id: courseId, institutionId },
  })

  return NextResponse.json({ deleted: true })
}
