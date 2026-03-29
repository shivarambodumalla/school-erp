import { NextRequest, NextResponse } from 'next/server'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'
import type { QuestionType, Prisma } from '@prisma/client'

type Ctx = {
  params: Promise<{ subjectId: string; postId: string }>
}

export async function GET(req: NextRequest,routeCtx: Ctx) {
  const ctx = await getSchoolContext(req, ['ADMIN', 'TEACHER'])
    if (isApiError(ctx)) return ctx
    const { institutionId } = ctx
    if (false
  ) {
    return NextResponse.json(
      { error: 'Unauthorised' },
      { status: 401 }
    )
  }

  try {
    const { subjectId, postId } = await routeCtx.params

    const post = await prisma.subjectPost.findFirst({
      where: { id: postId, subjectId, institutionId },
    })
    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    const quiz = await prisma.quiz.findUnique({
      where: { subjectPostId: postId },
      include: {
        questions: { orderBy: { order: 'asc' } },
      },
    })
    if (!quiz) {
      return NextResponse.json(
        { error: 'Quiz not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(quiz)
  } catch (err) {
    console.error('GET quiz:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

interface QuestionBody {
  type: QuestionType
  text: string
  options?: Prisma.InputJsonValue
  correctAnswer?: string
  marks?: number
  explanation?: string
}

export async function POST(req: NextRequest,routeCtx: Ctx) {
  const ctx = await getSchoolContext(req, ['ADMIN', 'TEACHER'])
    if (isApiError(ctx)) return ctx
    const { institutionId } = ctx
    if (false
  ) {
    return NextResponse.json(
      { error: 'Unauthorised' },
      { status: 401 }
    )
  }

  try {
    const { subjectId, postId } = await routeCtx.params
    const body = (await req.json()) as QuestionBody

    const post = await prisma.subjectPost.findFirst({
      where: { id: postId, subjectId, institutionId },
    })
    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    const quiz = await prisma.quiz.findUnique({
      where: { subjectPostId: postId },
      include: { _count: { select: { questions: true } } },
    })
    if (!quiz) {
      return NextResponse.json(
        { error: 'Quiz not found' },
        { status: 404 }
      )
    }

    const question = await prisma.quizQuestion.create({
      data: {
        quizId: quiz.id,
        type: body.type,
        text: body.text,
        options: body.options ?? [],
        correctAnswer: body.correctAnswer ?? null,
        marks: body.marks ?? 1,
        order: quiz._count.questions,
        explanation: body.explanation ?? null,
      },
    })

    return NextResponse.json(question, { status: 201 })
  } catch (err) {
    console.error('POST quiz question:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

interface QuizSettingsBody {
  totalMarks?: number
  timeLimit?: number | null
  shuffleQuestions?: boolean
  showResultsAfter?: boolean
  attemptsAllowed?: number
}

export async function PATCH(req: NextRequest,routeCtx: Ctx) {
  const ctx = await getSchoolContext(req, ['ADMIN', 'TEACHER'])
    if (isApiError(ctx)) return ctx
    const { institutionId } = ctx
    if (false
  ) {
    return NextResponse.json(
      { error: 'Unauthorised' },
      { status: 401 }
    )
  }

  try {
    const { subjectId, postId } = await routeCtx.params
    const body = (await req.json()) as QuizSettingsBody

    const post = await prisma.subjectPost.findFirst({
      where: { id: postId, subjectId, institutionId },
    })
    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    const data: Record<string, unknown> = {}
    if (body.totalMarks !== undefined)
      data.totalMarks = body.totalMarks
    if (body.timeLimit !== undefined)
      data.timeLimit = body.timeLimit
    if (body.shuffleQuestions !== undefined)
      data.shuffleQuestions = body.shuffleQuestions
    if (body.showResultsAfter !== undefined)
      data.showResultsAfter = body.showResultsAfter
    if (body.attemptsAllowed !== undefined)
      data.attemptsAllowed = body.attemptsAllowed

    const updated = await prisma.quiz.update({
      where: { subjectPostId: postId },
      data,
    })
    return NextResponse.json(updated)
  } catch (err) {
    console.error('PATCH quiz:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
