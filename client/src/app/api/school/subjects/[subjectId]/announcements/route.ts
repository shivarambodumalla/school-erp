import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'

type RouteContext = { params: Promise<{ subjectId: string }> }

// GET /api/school/subjects/[subjectId]/announcements
export async function GET(req: Request, ctx: RouteContext) {
  const result = await getSchoolContext(req, ['ADMIN', 'TEACHER', 'STUDENT'])
  if (isApiError(result)) return result
  const { institutionId } = result
  const { subjectId } = await ctx.params

  const subject = await prisma.subject.findFirst({
    where: { id: subjectId, institutionId },
  })
  if (!subject) {
    return NextResponse.json({ error: 'Subject not found' }, { status: 404 })
  }

  const announcements = await prisma.subjectAnnouncement.findMany({
    where: { subjectId, institutionId },
    include: {
      _count: { select: { reads: true } },
    },
    orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
  })

  return NextResponse.json(announcements)
}

// POST /api/school/subjects/[subjectId]/announcements
export async function POST(req: Request, ctx: RouteContext) {
  const result = await getSchoolContext(req, ['ADMIN', 'TEACHER'])
  if (isApiError(result)) return result
  const { institutionId, userId } = result
  const { subjectId } = await ctx.params

  const subject = await prisma.subject.findFirst({
    where: { id: subjectId, institutionId },
  })
  if (!subject) {
    return NextResponse.json({ error: 'Subject not found' }, { status: 404 })
  }

  const body = await req.json() as {
    title: string
    content: string
    isUrgent?: boolean
    isPinned?: boolean
    expiresAt?: string
  }

  if (!body.title?.trim() || !body.content?.trim()) {
    return NextResponse.json({ error: 'Title and content are required' }, { status: 400 })
  }

  const announcement = await prisma.subjectAnnouncement.create({
    data: {
      subjectId,
      institutionId,
      title: body.title.trim(),
      content: body.content.trim(),
      isUrgent: body.isUrgent ?? false,
      isPinned: body.isPinned ?? false,
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
      createdById: userId,
    },
  })

  return NextResponse.json(announcement, { status: 201 })
}
