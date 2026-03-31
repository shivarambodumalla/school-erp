import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'

type RouteContext = { params: Promise<{ subjectId: string; announcementId: string }> }

// DELETE /api/school/subjects/[subjectId]/announcements/[announcementId]
export async function DELETE(req: Request, ctx: RouteContext) {
  const result = await getSchoolContext(req, ['ADMIN', 'TEACHER'])
  if (isApiError(result)) return result
  const { institutionId } = result
  const { subjectId, announcementId } = await ctx.params

  const subject = await prisma.subject.findFirst({
    where: { id: subjectId, institutionId },
  })
  if (!subject) {
    return NextResponse.json({ error: 'Subject not found' }, { status: 404 })
  }

  const announcement = await prisma.subjectAnnouncement.findFirst({
    where: { id: announcementId, subjectId, institutionId },
  })
  if (!announcement) {
    return NextResponse.json({ error: 'Announcement not found' }, { status: 404 })
  }

  await prisma.subjectAnnouncement.delete({ where: { id: announcementId } })

  return NextResponse.json({ success: true })
}
