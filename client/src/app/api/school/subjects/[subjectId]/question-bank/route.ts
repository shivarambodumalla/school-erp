import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'

type RouteContext = { params: Promise<{ subjectId: string }> }

// GET /api/school/subjects/[subjectId]/question-bank
export async function GET(req: Request, ctx: RouteContext) {
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

  const banks = await prisma.questionBank.findMany({
    where: {
      institutionId,
      OR: [{ subjectId }, { isShared: true }],
    },
    include: { _count: { select: { questions: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(banks)
}

// POST /api/school/subjects/[subjectId]/question-bank
export async function POST(req: Request, ctx: RouteContext) {
  const result = await getSchoolContext(req, ['ADMIN', 'TEACHER'])
  if (isApiError(result)) return result
  const { institutionId, userId } = result
  const { subjectId } = await ctx.params

  const subject = await prisma.subject.findFirst({
    where: { id: subjectId, institutionId },
  })
  if (!subject) {
    return NextResponse.json({ error: 'Subject not found' }, { status: 404 })
  }

  const body = await req.json() as {
    name: string
    description?: string
    isShared?: boolean
  }

  if (!body.name?.trim()) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 })
  }

  const bank = await prisma.questionBank.create({
    data: {
      institutionId,
      subjectId,
      name: body.name.trim(),
      description: body.description?.trim() ?? null,
      isShared: body.isShared ?? false,
      createdById: userId,
    },
  })

  return NextResponse.json(bank, { status: 201 })
}
