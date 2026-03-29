import { NextRequest, NextResponse } from 'next/server'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'

interface RouteContext {
  params: Promise<{ courseId: string }>
}


export async function GET(req: NextRequest, { params }: RouteContext) {
  const ctx = await getSchoolContext(req, ['ADMIN', 'TEACHER', 'STUDENT'])
  if (isApiError(ctx)) return ctx
  const { institutionId } = ctx

  const { courseId } = await params

  const isStudent = ctx.portalType === 'STUDENT'

  const posts = await prisma.coursePost.findMany({
    where: {
      courseId,
      course: { institutionId },
      ...(isStudent ? { isPublished: true } : {}),
    },
    include: { attachments: true },
    orderBy: { order: 'asc' },
  })

  return NextResponse.json({ posts })
}

export async function POST(req: NextRequest, { params }: RouteContext) {
  const ctx = await getSchoolContext(req, ['ADMIN', 'TEACHER', 'INSTRUCTOR'])
  if (isApiError(ctx)) return ctx
  const { institutionId } = ctx

  const { courseId } = await params
  const body = (await req.json()) as {
    type: string
    title: string
    description?: string
    topicTag?: string
    isPublished?: boolean
    order?: number
  }

  const course = await prisma.course.findFirst({
    where: { id: courseId, institutionId },
  })
  if (!course) {
    return NextResponse.json({ error: 'Course not found' }, { status: 404 })
  }

  const post = await prisma.coursePost.create({
    data: {
      courseId,
      type: body.type as 'MATERIAL' | 'ASSIGNMENT' | 'QUIZ' | 'POLL' | 'EXAM' | 'ANNOUNCEMENT' | 'HOMEWORK',
      title: body.title,
      description: body.description ?? null,
      topicTag: body.topicTag ?? null,
      isPublished: body.isPublished ?? true,
      order: body.order ?? 0,
      createdById: ctx.userId,
    },
  })

  return NextResponse.json(post, { status: 201 })
}
