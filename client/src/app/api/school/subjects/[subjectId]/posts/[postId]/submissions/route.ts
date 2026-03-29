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
      include: { assignment: true },
    })
    if (!post || !post.assignment) {
      return NextResponse.json(
        { error: 'Assignment not found' },
        { status: 404 }
      )
    }

    const submissions =
      await prisma.assignmentSubmission.findMany({
        where: { assignmentId: post.assignment.id },
        include: {
          student: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              admissionNo: true,
              rollNo: true,
              photoUrl: true,
            },
          },
        },
        orderBy: { submittedAt: 'desc' },
      })

    return NextResponse.json(submissions)
  } catch (err) {
    console.error('GET submissions:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

interface GradeBody {
  submissionId: string
  marksObtained: number
  feedback?: string
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
    const body = (await req.json()) as GradeBody

    const post = await prisma.subjectPost.findFirst({
      where: { id: postId, subjectId, institutionId },
    })
    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    const updated =
      await prisma.assignmentSubmission.update({
        where: { id: body.submissionId },
        data: {
          marksObtained: body.marksObtained,
          feedback: body.feedback ?? null,
          gradedById: ctx.userId,
          gradedAt: new Date(),
          status: 'GRADED',
        },
      })

    return NextResponse.json(updated)
  } catch (err) {
    console.error('PATCH submission:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
