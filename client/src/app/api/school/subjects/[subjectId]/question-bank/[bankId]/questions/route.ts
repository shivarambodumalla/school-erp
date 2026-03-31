import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'
import { Prisma, DifficultyLevel } from '@prisma/client'

type RouteContext = { params: Promise<{ subjectId: string; bankId: string }> }

// GET /api/school/subjects/[subjectId]/question-bank/[bankId]/questions
export async function GET(req: Request, ctx: RouteContext) {
  const result = await getSchoolContext(req, ['ADMIN', 'TEACHER'])
  if (isApiError(result)) return result
  const { institutionId } = result
  const { subjectId, bankId } = await ctx.params

  const subject = await prisma.subject.findFirst({
    where: { id: subjectId, institutionId },
  })
  if (!subject) {
    return NextResponse.json({ error: 'Subject not found' }, { status: 404 })
  }

  const bank = await prisma.questionBank.findFirst({
    where: { id: bankId, institutionId },
  })
  if (!bank) {
    return NextResponse.json({ error: 'Question bank not found' }, { status: 404 })
  }

  const url = new URL(req.url)
  const difficulty = url.searchParams.get('difficulty')
  const tag = url.searchParams.get('tag')

  const where: Record<string, unknown> = { questionBankId: bankId }
  if (difficulty) where.difficultyLevel = difficulty
  if (tag) where.tags = { has: tag }

  const questions = await prisma.questionBankItem.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(questions)
}

// POST /api/school/subjects/[subjectId]/question-bank/[bankId]/questions
export async function POST(req: Request, ctx: RouteContext) {
  const result = await getSchoolContext(req, ['ADMIN', 'TEACHER'])
  if (isApiError(result)) return result
  const { institutionId, userId } = result
  const { subjectId, bankId } = await ctx.params

  const subject = await prisma.subject.findFirst({
    where: { id: subjectId, institutionId },
  })
  if (!subject) {
    return NextResponse.json({ error: 'Subject not found' }, { status: 404 })
  }

  const bank = await prisma.questionBank.findFirst({
    where: { id: bankId, institutionId },
  })
  if (!bank) {
    return NextResponse.json({ error: 'Question bank not found' }, { status: 404 })
  }

  const body = await req.json() as {
    type: string
    text: string
    options?: unknown[]
    correctAnswer?: string
    explanation?: string
    marks?: number
    difficultyLevel?: string
    tags?: string[]
    topicTag?: string
  }

  if (!body.type || !body.text?.trim()) {
    return NextResponse.json({ error: 'type and text are required' }, { status: 400 })
  }

  const question = await prisma.questionBankItem.create({
    data: {
      questionBankId: bankId,
      institutionId,
      type: body.type as 'MCQ' | 'MULTI_SELECT' | 'SHORT' | 'LONG' | 'TRUE_FALSE',
      text: body.text.trim(),
      options: (body.options as Prisma.InputJsonValue) ?? [],
      correctAnswer: body.correctAnswer ?? null,
      explanation: body.explanation?.trim() ?? null,
      marks: body.marks ?? 1,
      difficultyLevel: (body.difficultyLevel as DifficultyLevel) ?? 'MEDIUM',
      tags: body.tags ?? [],
      topicTag: body.topicTag ?? null,
      subjectName: subject.name,
      createdById: userId,
    },
  })

  return NextResponse.json(question, { status: 201 })
}
