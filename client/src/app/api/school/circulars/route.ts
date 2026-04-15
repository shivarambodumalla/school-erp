import { NextResponse } from 'next/server'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  const ctx = await getSchoolContext(req, ['ADMIN', 'TEACHER', 'PARENT', 'STUDENT'])
  if (isApiError(ctx)) return ctx
  const { institutionId } = ctx

  const url = new URL(req.url)
  const audience = url.searchParams.get('audience')
  const pinned = url.searchParams.get('pinned')
  const page = Math.max(1, Number(url.searchParams.get('page') ?? '1'))
  const take = Math.min(50, Math.max(1, Number(url.searchParams.get('take') ?? '20')))
  const skip = (page - 1) * take

  const where: Record<string, unknown> = {
    institutionId,
    publishedAt: { not: null, lte: new Date() },
    OR: [
      { expiresAt: null },
      { expiresAt: { gt: new Date() } },
    ],
  }
  if (audience) where.targetAudience = audience
  if (pinned === 'true') where.isPinned = true

  const [circulars, total] = await Promise.all([
    prisma.schoolCircular.findMany({
      where,
      orderBy: [{ isPinned: 'desc' }, { publishedAt: 'desc' }],
      skip,
      take,
      include: {
        createdBy: { select: { id: true, firstName: true, lastName: true } },
        _count: { select: { reads: true } },
      },
    }),
    prisma.schoolCircular.count({ where }),
  ])

  // Attach read status for the current user
  const circularIds = circulars.map(c => c.id)
  const reads = circularIds.length > 0
    ? await prisma.circularRead.findMany({
        where: { circularId: { in: circularIds }, userId: ctx.userId },
        select: { circularId: true },
      })
    : []
  const readSet = new Set(reads.map(r => r.circularId))

  const result = circulars.map(c => ({
    ...c,
    readCount: c._count.reads,
    isRead: readSet.has(c.id),
    _count: undefined,
  }))

  return NextResponse.json({ circulars: result, total, page, take })
}

export async function POST(req: Request) {
  const ctx = await getSchoolContext(req, ['ADMIN', 'TEACHER'])
  if (isApiError(ctx)) return ctx
  const { institutionId } = ctx

  // Resolve staff record for the logged-in user
  const staff = await prisma.staff.findFirst({
    where: { institutionId, userId: ctx.userId, status: 'ACTIVE' },
    select: { id: true },
  })
  if (!staff) {
    return NextResponse.json({ error: 'Staff record not found' }, { status: 404 })
  }

  const body = await req.json() as {
    title?: string
    content?: string
    targetAudience?: string
    targetClassIds?: string[]
    isPinned?: boolean
    publishedAt?: string
    expiresAt?: string
  }

  const { title, content, targetAudience, targetClassIds, isPinned, publishedAt, expiresAt } = body

  if (!title || !content) {
    return NextResponse.json(
      { error: 'title and content are required' },
      { status: 400 },
    )
  }

  const circular = await prisma.schoolCircular.create({
    data: {
      institutionId,
      title,
      content,
      targetAudience: (targetAudience as 'ALL' | 'STUDENTS' | 'PARENTS' | 'STAFF' | 'CLASS') ?? 'ALL',
      targetClassIds: targetClassIds ?? [],
      isPinned: isPinned ?? false,
      publishedAt: publishedAt ? new Date(publishedAt) : new Date(),
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      createdById: staff.id,
    },
    include: {
      createdBy: { select: { id: true, firstName: true, lastName: true } },
    },
  })

  return NextResponse.json(circular, { status: 201 })
}
