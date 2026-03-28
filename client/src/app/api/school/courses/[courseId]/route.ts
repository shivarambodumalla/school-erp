import { NextResponse } from 'next/server'
import { auth } from '@/server/auth'
import { prisma } from '@/lib/prisma'

interface RouteContext {
  params: Promise<{ courseId: string }>
}

export async function GET(_req: Request, ctx: RouteContext) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const { courseId } = await ctx.params
  const institutionId = session.user.institutionId

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
  if (session.user.portalType === 'STUDENT') {
    const student = await prisma.student.findFirst({
      where: { userId: session.user.id, institutionId },
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

export async function PATCH(req: Request, ctx: RouteContext) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const { courseId } = await ctx.params
  const institutionId = session.user.institutionId
  const body = (await req.json()) as Record<string, unknown>

  const updated = await prisma.course.update({
    where: { id: courseId, institutionId },
    data: body,
  })

  return NextResponse.json(updated)
}

export async function DELETE(_req: Request, ctx: RouteContext) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const { courseId } = await ctx.params
  const institutionId = session.user.institutionId

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
