import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'
import { Prisma, DifficultyLevel } from '@prisma/client'

type RouteContext = {
  params: Promise<{ subjectId: string; bankId: string; questionId: string }>
}

// PATCH /api/school/subjects/[subjectId]/question-bank/[bankId]/questions/[questionId]
export async function PATCH(req: Request, ctx: RouteContext) {
  const result = await getSchoolContext(req, ['ADMIN', 'TEACHER'])
  if (isApiError(result)) return result
  const { institutionId } = result
  const { subjectId, bankId, questionId } = await ctx.params

  const subject = await prisma.subject.findFirst({
    where: { id: subjectId, institutionId },
  })
  if (!subject) {
    return NextResponse.json({ error: 'Subject not found' }, { status: 404 })
  }

  const question = await prisma.questionBankItem.findFirst({
    where: { id: questionId, questionBankId: bankId, institutionId },
  })
  if (!question) {
    return NextResponse.json({ error: 'Question not found' }, { status: 404 })
  }

  const body = await req.json() as {
    text?: string
    options?: unknown[]
    correctAnswer?: string
    explanation?: string
    marks?: number
    difficultyLevel?: string
    tags?: string[]
    topicTag?: string
  }

  const updated = await prisma.questionBankItem.update({
    where: { id: questionId },
    data: {
      ...(body.text !== undefined && { text: body.text.trim() }),
      ...(body.options !== undefined && { options: body.options as Prisma.InputJsonValue ?? [] }),
      ...(body.correctAnswer !== undefined && { correctAnswer: body.correctAnswer }),
      ...(body.explanation !== undefined && { explanation: body.explanation }),
      ...(body.marks !== undefined && { marks: body.marks }),
      ...(body.difficultyLevel !== undefined && { difficultyLevel: body.difficultyLevel as DifficultyLevel }),
      ...(body.tags !== undefined && { tags: body.tags }),
      ...(body.topicTag !== undefined && { topicTag: body.topicTag }),
    },
  })

  return NextResponse.json(updated)
}

// DELETE /api/school/subjects/[subjectId]/question-bank/[bankId]/questions/[questionId]
export async function DELETE(req: Request, ctx: RouteContext) {
  const result = await getSchoolContext(req, ['ADMIN', 'TEACHER'])
  if (isApiError(result)) return result
  const { institutionId } = result
  const { subjectId, bankId, questionId } = await ctx.params

  const subject = await prisma.subject.findFirst({
    where: { id: subjectId, institutionId },
  })
  if (!subject) {
    return NextResponse.json({ error: 'Subject not found' }, { status: 404 })
  }

  const question = await prisma.questionBankItem.findFirst({
    where: { id: questionId, questionBankId: bankId, institutionId },
  })
  if (!question) {
    return NextResponse.json({ error: 'Question not found' }, { status: 404 })
  }

  await prisma.questionBankItem.delete({ where: { id: questionId } })

  return NextResponse.json({ success: true })
}
