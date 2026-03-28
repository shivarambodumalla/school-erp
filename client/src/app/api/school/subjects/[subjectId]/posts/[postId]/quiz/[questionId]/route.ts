import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/server/auth'
import { prisma } from '@/lib/prisma'
import type { QuestionType, Prisma } from '@prisma/client'

type Ctx = {
  params: Promise<{
    subjectId: string
    postId: string
    questionId: string
  }>
}

interface QuestionPatch {
  type?: QuestionType
  text?: string
  options?: Prisma.InputJsonValue
  correctAnswer?: string | null
  marks?: number
  order?: number
  explanation?: string | null
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const session = await auth()
  if (
    !session ||
    (session.user.portalType !== 'ADMIN' &&
      session.user.portalType !== 'TEACHER')
  ) {
    return NextResponse.json(
      { error: 'Unauthorised' },
      { status: 401 }
    )
  }

  const institutionId = session.user.institutionId
  try {
    const { subjectId, postId, questionId } =
      await ctx.params
    const body = (await req.json()) as QuestionPatch

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
    if (body.type !== undefined) data.type = body.type
    if (body.text !== undefined) data.text = body.text
    if (body.options !== undefined)
      data.options = body.options
    if (body.correctAnswer !== undefined)
      data.correctAnswer = body.correctAnswer
    if (body.marks !== undefined) data.marks = body.marks
    if (body.order !== undefined) data.order = body.order
    if (body.explanation !== undefined)
      data.explanation = body.explanation

    const updated = await prisma.quizQuestion.update({
      where: { id: questionId },
      data,
    })
    return NextResponse.json(updated)
  } catch (err) {
    console.error('PATCH question:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const session = await auth()
  if (
    !session ||
    (session.user.portalType !== 'ADMIN' &&
      session.user.portalType !== 'TEACHER')
  ) {
    return NextResponse.json(
      { error: 'Unauthorised' },
      { status: 401 }
    )
  }

  const institutionId = session.user.institutionId
  try {
    const { subjectId, postId, questionId } =
      await ctx.params

    const post = await prisma.subjectPost.findFirst({
      where: { id: postId, subjectId, institutionId },
    })
    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    await prisma.quizQuestion.delete({
      where: { id: questionId },
    })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('DELETE question:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
