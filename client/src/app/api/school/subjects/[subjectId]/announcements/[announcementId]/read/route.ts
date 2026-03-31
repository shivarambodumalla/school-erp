import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'

type RouteContext = { params: Promise<{ subjectId: string; announcementId: string }> }

// POST /api/school/subjects/[subjectId]/announcements/[announcementId]/read
export async function POST(req: Request, ctx: RouteContext) {
  const result = await getSchoolContext(req, ['ADMIN', 'TEACHER', 'STUDENT'])
  if (isApiError(result)) return result
  const { institutionId, userId } = result
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

  await prisma.subjectAnnouncementRead.upsert({
    where: {
      announcementId_userId: { announcementId, userId },
    },
    create: { announcementId, userId },
    update: { readAt: new Date() },
  })

  return NextResponse.json({ success: true })
}
