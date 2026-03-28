import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/server/auth'
import { prisma } from '@/lib/prisma'

type Ctx = {
  params: Promise<{ subjectId: string; postId: string }>
}

export async function GET(_req: NextRequest, ctx: Ctx) {
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
    const { subjectId, postId } = await ctx.params

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
    const { subjectId, postId } = await ctx.params
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
          gradedById: session.user.id,
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
