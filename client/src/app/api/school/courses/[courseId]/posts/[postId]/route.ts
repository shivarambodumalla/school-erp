import { NextResponse } from 'next/server'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'

interface RouteContext {
  params: Promise<{ courseId: string; postId: string }>
}


export async function PATCH(req: Request,routeCtx: RouteContext) {
  const ctx = await getSchoolContext(req, ['ADMIN', 'TEACHER', 'INSTRUCTOR'])
    if (isApiError(ctx)) return ctx
    const { institutionId } = ctx

  const { courseId, postId } = await routeCtx.params
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

export async function DELETE(req: Request,routeCtx: RouteContext) {
  const ctx = await getSchoolContext(req, ['ADMIN', 'TEACHER', 'INSTRUCTOR'])
    if (isApiError(ctx)) return ctx
    const { institutionId } = ctx

  const { courseId, postId } = await routeCtx.params

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
