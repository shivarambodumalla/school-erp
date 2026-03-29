import { NextRequest, NextResponse } from 'next/server'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'

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
      include: {
        attachments: true,
        assignment: {
          include: {
            _count: { select: { submissions: true } },
          },
        },
        quiz: {
          include: {
            _count: { select: { attempts: true } },
          },
        },
        poll: {
          include: { _count: { select: { votes: true } } },
        },
      },
    })

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }
    return NextResponse.json(post)
  } catch (err) {
    console.error('GET single post:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

interface PatchBody {
  title?: string
  description?: string
  scheduledAt?: string | null
  canPreview?: boolean
  canDownload?: boolean
  isPublished?: boolean
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
    const body = (await req.json()) as PatchBody

    const exists = await prisma.subjectPost.findFirst({
      where: { id: postId, subjectId, institutionId },
    })
    if (!exists) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    const data: Record<string, unknown> = {}
    if (body.title !== undefined) data.title = body.title
    if (body.description !== undefined)
      data.description = body.description
    if (body.scheduledAt !== undefined)
      data.scheduledAt = body.scheduledAt
        ? new Date(body.scheduledAt)
        : null
    if (body.canPreview !== undefined)
      data.canPreview = body.canPreview
    if (body.canDownload !== undefined)
      data.canDownload = body.canDownload
    if (body.isPublished !== undefined)
      data.isPublished = body.isPublished

    const updated = await prisma.subjectPost.update({
      where: { id: postId },
      data,
    })
    return NextResponse.json(updated)
  } catch (err) {
    console.error('PATCH post:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest,routeCtx: Ctx) {
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

    await prisma.subjectAttachment.deleteMany({
      where: { subjectPostId: postId },
    })
    // Delete assignment children then parent
    const assignment = await prisma.assignment.findUnique({
      where: { subjectPostId: postId },
    })
    if (assignment) {
      await prisma.assignmentSubmission.deleteMany({
        where: { assignmentId: assignment.id },
      })
      await prisma.assignment.delete({
        where: { id: assignment.id },
      })
    }
    // Delete quiz children then parent
    const quiz = await prisma.quiz.findUnique({
      where: { subjectPostId: postId },
    })
    if (quiz) {
      await prisma.quizQuestion.deleteMany({
        where: { quizId: quiz.id },
      })
      await prisma.quizAttempt.deleteMany({
        where: { quizId: quiz.id },
      })
      await prisma.quiz.delete({
        where: { id: quiz.id },
      })
    }
    // Delete poll children then parent
    const poll = await prisma.poll.findUnique({
      where: { subjectPostId: postId },
    })
    if (poll) {
      await prisma.pollVote.deleteMany({
        where: { pollId: poll.id },
      })
      await prisma.poll.delete({
        where: { id: poll.id },
      })
    }
    // Delete homework children then parent
    const homeworkLogs =
      await prisma.homeworkLog.findMany({
        where: { subjectPostId: postId },
      })
    for (const hw of homeworkLogs) {
      await prisma.homeworkCompletion.deleteMany({
        where: { homeworkId: hw.id },
      })
    }
    await prisma.homeworkLog.deleteMany({
      where: { subjectPostId: postId },
    })
    await prisma.subjectPost.delete({
      where: { id: postId },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('DELETE post:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
