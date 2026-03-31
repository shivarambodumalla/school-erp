import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'
import { Prisma, SubjectModuleItemType, CompletionType, DripTrigger } from '@prisma/client'

type RouteContext = { params: Promise<{ subjectId: string; moduleId: string }> }

// GET /api/school/subjects/[subjectId]/modules/[moduleId]/items
export async function GET(req: Request, ctx: RouteContext) {
  const result = await getSchoolContext(req, ['ADMIN', 'TEACHER', 'STUDENT'])
  if (isApiError(result)) return result
  const { institutionId } = result
  const { subjectId, moduleId } = await ctx.params

  const subject = await prisma.subject.findFirst({
    where: { id: subjectId, institutionId },
  })
  if (!subject) {
    return NextResponse.json({ error: 'Subject not found' }, { status: 404 })
  }

  const mod = await prisma.subjectModule.findFirst({
    where: { id: moduleId, subjectId },
  })
  if (!mod) {
    return NextResponse.json({ error: 'Module not found' }, { status: 404 })
  }

  const items = await prisma.subjectModuleItem.findMany({
    where: { moduleId, subjectId },
    orderBy: { order: 'asc' },
  })

  return NextResponse.json(items)
}

// POST /api/school/subjects/[subjectId]/modules/[moduleId]/items — create item
export async function POST(req: Request, ctx: RouteContext) {
  const result = await getSchoolContext(req, ['ADMIN', 'TEACHER'])
  if (isApiError(result)) return result
  const { institutionId, userId } = result
  const { subjectId, moduleId } = await ctx.params

  const subject = await prisma.subject.findFirst({
    where: { id: subjectId, institutionId },
  })
  if (!subject) {
    return NextResponse.json({ error: 'Subject not found' }, { status: 404 })
  }

  const mod = await prisma.subjectModule.findFirst({
    where: { id: moduleId, subjectId },
  })
  if (!mod) {
    return NextResponse.json({ error: 'Module not found' }, { status: 404 })
  }

  const body = await req.json() as {
    type: string
    title: string
    description?: string
    content?: Record<string, unknown>
    isPublished?: boolean
    scheduledAt?: string
    dripDays?: number
    dripTrigger?: string
    completionType?: string
    minScore?: number
    estimatedMinutes?: number
  }

  if (!body.type || !body.title?.trim()) {
    return NextResponse.json({ error: 'type and title are required' }, { status: 400 })
  }

  const maxOrder = await prisma.subjectModuleItem.aggregate({
    where: { moduleId },
    _max: { order: true },
  })

  const item = await prisma.subjectModuleItem.create({
    data: {
      subjectId,
      moduleId,
      type: body.type as SubjectModuleItemType,
      title: body.title.trim(),
      description: body.description?.trim() ?? null,
      content: (body.content ?? {}) as Prisma.InputJsonValue,
      isPublished: body.isPublished ?? true,
      scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : null,
      dripDays: body.dripDays ?? null,
      dripTrigger: (body.dripTrigger as DripTrigger) ?? null,
      completionType: (body.completionType as CompletionType) ?? 'VIEW',
      minScore: body.minScore ?? null,
      estimatedMinutes: body.estimatedMinutes ?? null,
      createdById: userId,
      order: (maxOrder._max.order ?? -1) + 1,
    },
  })

  return NextResponse.json(item, { status: 201 })
}
