import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'

type RouteContext = {
  params: Promise<{ subjectId: string; discussionId: string; replyId: string }>
}

// DELETE /api/school/subjects/[subjectId]/discussions/[discussionId]/replies/[replyId]
export async function DELETE(req: Request, ctx: RouteContext) {
  const result = await getSchoolContext(req, ['ADMIN', 'TEACHER', 'STUDENT'])
  if (isApiError(result)) return result
  const { institutionId, userId, portalType } = result
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

  // Students can only delete their own replies; teachers/admins can delete any
  if (portalType === 'STUDENT' && reply.userId !== userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  await prisma.subjectDiscussionReply.delete({ where: { id: replyId } })

  return NextResponse.json({ success: true })
}
