import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'

type RouteContext = { params: Promise<{ subjectId: string }> }

// GET /api/school/subjects/[subjectId]/modules — list modules with items
export async function GET(req: Request, ctx: RouteContext) {
  const result = await getSchoolContext(req, ['ADMIN', 'TEACHER', 'STUDENT'])
  if (isApiError(result)) return result
  const { institutionId } = result
  const { subjectId: rawId } = await ctx.params
  const isNumeric = /^\d+$/.test(rawId)

  const subject = await prisma.subject.findFirst({
    where: {
      ...(isNumeric ? { serialNo: parseInt(rawId, 10) } : { id: rawId }),
      institutionId,
    },
    select: { id: true },
  })
  if (!subject) {
    return NextResponse.json({ error: 'Subject not found' }, { status: 404 })
  }

  const subjectId = subject.id

  const modules = await prisma.subjectModule.findMany({
    where: { subjectId },
    orderBy: { order: 'asc' },
    include: {
      items: { orderBy: { order: 'asc' } },
    },
  })

  return NextResponse.json(modules)
}

// POST /api/school/subjects/[subjectId]/modules — create module
export async function POST(req: Request, ctx: RouteContext) {
  const result = await getSchoolContext(req, ['ADMIN', 'TEACHER'])
  if (isApiError(result)) return result
  const { institutionId } = result
  const { subjectId } = await ctx.params

  const subject = await prisma.subject.findFirst({
    where: { id: subjectId, institutionId },
  })
  if (!subject) {
    return NextResponse.json({ error: 'Subject not found' }, { status: 404 })
  }

  const body = await req.json() as {
    title: string
    description?: string
    isLocked?: boolean
    lockMessage?: string
    isPublished?: boolean
  }

  if (!body.title?.trim()) {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 })
  }

  const maxOrder = await prisma.subjectModule.aggregate({
    where: { subjectId },
    _max: { order: true },
  })

  const mod = await prisma.subjectModule.create({
    data: {
      subjectId,
      title: body.title.trim(),
      description: body.description?.trim() ?? null,
      isLocked: body.isLocked ?? false,
      lockMessage: body.lockMessage ?? null,
      isPublished: body.isPublished ?? true,
      order: (maxOrder._max.order ?? -1) + 1,
    },
    include: { items: true },
  })

  return NextResponse.json(mod, { status: 201 })
}
