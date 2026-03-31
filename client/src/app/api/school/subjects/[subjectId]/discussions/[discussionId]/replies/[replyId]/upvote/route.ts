import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'

type RouteContext = {
  params: Promise<{ subjectId: string; discussionId: string; replyId: string }>
}

// POST /api/school/subjects/[subjectId]/discussions/[discussionId]/replies/[replyId]/upvote
export async function POST(req: Request, ctx: RouteContext) {
  const result = await getSchoolContext(req, ['ADMIN', 'TEACHER', 'STUDENT'])
  if (isApiError(result)) return result
  const { institutionId } = result
  const { subjectId, discussionId, replyId } = await ctx.params

  const subject = await prisma.subject.findFirst({
    where: { id: subjectId, institutionId },
  })
  if (!subject) {
    return NextResponse.json({ error: 'Subject not found' }, { status: 404 })
  }

  const reply = await prisma.subjectDiscussionReply.findFirst({
    where: { id: replyId, discussionId, subjectId },
  })
  if (!reply) {
    return NextResponse.json({ error: 'Reply not found' }, { status: 404 })
  }

  const updated = await prisma.subjectDiscussionReply.update({
    where: { id: replyId },
    data: { upvotes: { increment: 1 } },
  })

  return NextResponse.json(updated)
}
