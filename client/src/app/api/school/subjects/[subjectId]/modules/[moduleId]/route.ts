import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'

type RouteContext = { params: Promise<{ subjectId: string; moduleId: string }> }

// PATCH /api/school/subjects/[subjectId]/modules/[moduleId] — update module
export async function PATCH(req: Request, ctx: RouteContext) {
  const result = await getSchoolContext(req, ['ADMIN', 'TEACHER'])
  if (isApiError(result)) return result
  const { institutionId } = result
  const { subjectId, moduleId } = await ctx.params

  const subject = await prisma.subject.findFirst({
    where: { id: subjectId, institutionId },
  })
  if (!subject) {
    return NextResponse.json({ error: 'Subject not found' }, { status: 404 })
  }

  const existing = await prisma.subjectModule.findFirst({
    where: { id: moduleId, subjectId },
  })
  if (!existing) {
    return NextResponse.json({ error: 'Module not found' }, { status: 404 })
  }

  const body = await req.json() as {
    title?: string
    description?: string
    isLocked?: boolean
    lockMessage?: string
    isPublished?: boolean
  }

  const updated = await prisma.subjectModule.update({
    where: { id: moduleId },
    data: {
      ...(body.title !== undefined && { title: body.title.trim() }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.isLocked !== undefined && { isLocked: body.isLocked }),
      ...(body.lockMessage !== undefined && { lockMessage: body.lockMessage }),
      ...(body.isPublished !== undefined && { isPublished: body.isPublished }),
    },
    include: { items: { orderBy: { order: 'asc' } } },
  })

  return NextResponse.json(updated)
}

// DELETE /api/school/subjects/[subjectId]/modules/[moduleId]
export async function DELETE(req: Request, ctx: RouteContext) {
  const result = await getSchoolContext(req, ['ADMIN', 'TEACHER'])
  if (isApiError(result)) return result
  const { institutionId } = result
  const { subjectId, moduleId } = await ctx.params

  const subject = await prisma.subject.findFirst({
    where: { id: subjectId, institutionId },
  })
  if (!subject) {
    return NextResponse.json({ error: 'Subject not found' }, { status: 404 })
  }

  const existing = await prisma.subjectModule.findFirst({
    where: { id: moduleId, subjectId },
  })
  if (!existing) {
    return NextResponse.json({ error: 'Module not found' }, { status: 404 })
  }

  await prisma.subjectModule.delete({ where: { id: moduleId } })

  return NextResponse.json({ success: true })
}
