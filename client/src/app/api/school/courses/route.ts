import { NextResponse } from 'next/server'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'


export async function GET(req: Request) {
  const ctx = await getSchoolContext(req, ['ADMIN', 'TEACHER', 'INSTRUCTOR'])
    if (isApiError(ctx)) return ctx
    const { institutionId } = ctx
  const url = new URL(req.url)
  const status = url.searchParams.get('status')
  const search = url.searchParams.get('search')

  const where: Record<string, unknown> = { institutionId }
  if (status) where.status = status
  if (search) where.title = { contains: search, mode: 'insensitive' }

  const courses = await prisma.course.findMany({
    where,
    include: {
      _count: { select: { enrollments: true, posts: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ courses })
}

export async function POST(req: Request) {
  const ctx = await getSchoolContext(req, ['ADMIN', 'TEACHER', 'INSTRUCTOR'])
    if (isApiError(ctx)) return ctx
    const { institutionId } = ctx
  const body = (await req.json()) as {
    title: string
    description?: string
    targetType?: string
    targetIds?: string[]
    maxEnrollment?: number
  }

  const course = await prisma.course.create({
    data: {
      institutionId,
      title: body.title,
      description: body.description ?? null,
      instructorId: ctx.userId,
      targetType: (body.targetType as 'ALL' | 'CLASS' | 'SECTION') ?? 'ALL',
      targetIds: body.targetIds ?? [],
      maxEnrollment: body.maxEnrollment ?? null,
      status: 'DRAFT',
    },
  })

  return NextResponse.json(course, { status: 201 })
}
