import { NextResponse } from 'next/server'
import { auth } from '@/server/auth'
import { prisma } from '@/lib/prisma'

interface RouteContext {
  params: Promise<{ courseId: string; postId: string }>
}

const MANAGEMENT_TYPES = ['ADMIN', 'TEACHER', 'INSTRUCTOR']

export async function PATCH(req: Request, ctx: RouteContext) {
  const session = await auth()
  if (!session || !MANAGEMENT_TYPES.includes(session.user.portalType)) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const { courseId, postId } = await ctx.params
  const institutionId = session.user.institutionId
  const body = (await req.json()) as Record<string, unknown>

  const course = await prisma.course.findFirst({
    where: { id: courseId, institutionId },
  })
  if (!course) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const updated = await prisma.coursePost.update({
    where: { id: postId },
    data: body,
  })

  return NextResponse.json(updated)
}

export async function DELETE(_req: Request, ctx: RouteContext) {
  const session = await auth()
  if (!session || !MANAGEMENT_TYPES.includes(session.user.portalType)) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const { courseId, postId } = await ctx.params
  const institutionId = session.user.institutionId

  const course = await prisma.course.findFirst({
    where: { id: courseId, institutionId },
  })
  if (!course) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  await prisma.courseAttachment.deleteMany({
    where: { coursePostId: postId },
  })
  await prisma.coursePost.delete({ where: { id: postId } })

  return NextResponse.json({ deleted: true })
}
