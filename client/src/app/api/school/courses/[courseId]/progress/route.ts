import { NextResponse } from 'next/server'
import { auth } from '@/server/auth'
import { prisma } from '@/lib/prisma'

interface RouteContext {
  params: Promise<{ courseId: string }>
}

export async function POST(req: Request, ctx: RouteContext) {
  const session = await auth()
  if (!session || session.user.portalType !== 'STUDENT') {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const { courseId } = await ctx.params
  const institutionId = session.user.institutionId
  const body = (await req.json()) as { postId: string; completed: boolean }

  const student = await prisma.student.findFirst({
    where: { userId: session.user.id, institutionId },
  })
  if (!student) {
    return NextResponse.json({ error: 'Student not found' }, { status: 404 })
  }

  const enrollment = await prisma.courseEnrollment.findUnique({
    where: {
      courseId_studentId: { courseId, studentId: student.id },
    },
  })
  if (!enrollment) {
    return NextResponse.json({ error: 'Not enrolled' }, { status: 400 })
  }

  const current = (enrollment.completedPostIds as string[]) ?? []
  let updated: string[]

  if (body.completed) {
    updated = current.includes(body.postId)
      ? current
      : [...current, body.postId]
  } else {
    updated = current.filter((id) => id !== body.postId)
  }

  const totalPosts = await prisma.coursePost.count({
    where: { courseId, isPublished: true },
  })

  const progressPercent = totalPosts > 0
    ? Math.round((updated.length / totalPosts) * 100)
    : 0

  const result = await prisma.courseEnrollment.update({
    where: { id: enrollment.id },
    data: {
      completedPostIds: updated,
      progressPercent,
      completedAt: progressPercent >= 100 ? new Date() : null,
    },
  })

  return NextResponse.json({
    progressPercent: result.progressPercent,
    completedPostIds: updated,
  })
}
