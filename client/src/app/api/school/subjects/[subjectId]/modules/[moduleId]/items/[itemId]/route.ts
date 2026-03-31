import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'
import { Prisma, CompletionType, DripTrigger } from '@prisma/client'

type RouteContext = { params: Promise<{ subjectId: string; moduleId: string; itemId: string }> }

// PATCH /api/school/subjects/[subjectId]/modules/[moduleId]/items/[itemId]
export async function PATCH(req: Request, ctx: RouteContext) {
  const result = await getSchoolContext(req, ['ADMIN', 'TEACHER'])
  if (isApiError(result)) return result
  const { institutionId } = result
  const { subjectId, moduleId, itemId } = await ctx.params

  const subject = await prisma.subject.findFirst({
    where: { id: subjectId, institutionId },
  })
  if (!subject) {
    return NextResponse.json({ error: 'Subject not found' }, { status: 404 })
  }

  const existing = await prisma.subjectModuleItem.findFirst({
    where: { id: itemId, moduleId, subjectId },
  })
  if (!existing) {
    return NextResponse.json({ error: 'Item not found' }, { status: 404 })
  }

  const body = await req.json() as {
    title?: string
    description?: string
    content?: Record<string, unknown>
    isPublished?: boolean
    scheduledAt?: string | null
    dripDays?: number | null
    dripTrigger?: string | null
    completionType?: string
    minScore?: number | null
    estimatedMinutes?: number | null
  }

  const updated = await prisma.subjectModuleItem.update({
    where: { id: itemId },
    data: {
      ...(body.title !== undefined && { title: body.title.trim() }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.content !== undefined && { content: (body.content ?? Prisma.JsonNull) as Prisma.InputJsonValue }),
      ...(body.isPublished !== undefined && { isPublished: body.isPublished }),
      ...(body.scheduledAt !== undefined && { scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : null }),
      ...(body.dripDays !== undefined && { dripDays: body.dripDays }),
      ...(body.dripTrigger !== undefined && { dripTrigger: body.dripTrigger as DripTrigger }),
      ...(body.completionType !== undefined && { completionType: body.completionType as CompletionType }),
      ...(body.minScore !== undefined && { minScore: body.minScore }),
      ...(body.estimatedMinutes !== undefined && { estimatedMinutes: body.estimatedMinutes }),
    },
  })

  return NextResponse.json(updated)
}

// DELETE /api/school/subjects/[subjectId]/modules/[moduleId]/items/[itemId]
export async function DELETE(req: Request, ctx: RouteContext) {
  const result = await getSchoolContext(req, ['ADMIN', 'TEACHER'])
  if (isApiError(result)) return result
  const { institutionId } = result
  const { subjectId, moduleId, itemId } = await ctx.params

  const subject = await prisma.subject.findFirst({
    where: { id: subjectId, institutionId },
  })
  if (!subject) {
    return NextResponse.json({ error: 'Subject not found' }, { status: 404 })
  }

  const existing = await prisma.subjectModuleItem.findFirst({
    where: { id: itemId, moduleId, subjectId },
  })
  if (!existing) {
    return NextResponse.json({ error: 'Item not found' }, { status: 404 })
  }

  await prisma.subjectModuleItem.delete({ where: { id: itemId } })

  return NextResponse.json({ success: true })
}
