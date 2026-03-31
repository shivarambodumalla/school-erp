import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'

type RouteContext = { params: Promise<{ subjectId: string; discussionId: string }> }

// GET /api/school/subjects/[subjectId]/discussions/[discussionId]/replies
export async function GET(req: Request, ctx: RouteContext) {
  const result = await getSchoolContext(req, ['ADMIN', 'TEACHER', 'STUDENT'])
  if (isApiError(result)) return result
  const { institutionId } = result
  const { subjectId, discussionId } = await ctx.params

  const subject = await prisma.subject.findFirst({
    where: { id: subjectId, institutionId },
  })
  if (!subject) {
    return NextResponse.json({ error: 'Subject not found' }, { status: 404 })
  }

  const discussion = await prisma.subjectDiscussion.findFirst({
    where: { id: discussionId, subjectId },
  })
  if (!discussion) {
    return NextResponse.json({ error: 'Discussion not found' }, { status: 404 })
  }

  const replies = await prisma.subjectDiscussionReply.findMany({
    where: { discussionId },
    orderBy: { createdAt: 'asc' },
  })

  return NextResponse.json(replies)
}

// POST /api/school/subjects/[subjectId]/discussions/[discussionId]/replies
export async function POST(req: Request, ctx: RouteContext) {
  const result = await getSchoolContext(req, ['ADMIN', 'TEACHER', 'STUDENT'])
  if (isApiError(result)) return result
  const { institutionId, userId } = result
  const { subjectId, discussionId } = await ctx.params

  const subject = await prisma.subject.findFirst({
    where: { id: subjectId, institutionId },
  })
  if (!subject) {
    return NextResponse.json({ error: 'Subject not found' }, { status: 404 })
  }

  const discussion = await prisma.subjectDiscussion.findFirst({
    where: { id: discussionId, subjectId },
  })
  if (!discussion) {
    return NextResponse.json({ error: 'Discussion not found' }, { status: 404 })
  }

  if (discussion.closedAt) {
    return NextResponse.json({ error: 'Discussion is closed' }, { status: 400 })
  }

  const body = await req.json() as {
    content: string
    parentReplyId?: string
    isAnonymous?: boolean
  }

  if (!body.content?.trim()) {
    return NextResponse.json({ error: 'Content is required' }, { status: 400 })
  }

  const isAnonymous = body.isAnonymous && discussion.allowAnonymous

  const reply = await prisma.subjectDiscussionReply.create({
    data: {
      discussionId,
      userId,
      subjectId,
      content: body.content.trim(),
      parentReplyId: body.parentReplyId ?? null,
      isAnonymous: isAnonymous ?? false,
    },
  })

  return NextResponse.json(reply, { status: 201 })
}
