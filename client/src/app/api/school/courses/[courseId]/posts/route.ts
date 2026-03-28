import { NextResponse } from 'next/server'
import { auth } from '@/server/auth'
import { prisma } from '@/lib/prisma'

interface RouteContext {
  params: Promise<{ courseId: string }>
}

const MANAGEMENT_TYPES = ['ADMIN', 'TEACHER', 'INSTRUCTOR']

export async function GET(_req: Request, ctx: RouteContext) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const { courseId } = await ctx.params
  const institutionId = session.user.institutionId

  const isStudent = session.user.portalType === 'STUDENT'

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

export async function POST(req: Request, ctx: RouteContext) {
  const session = await auth()
  if (!session || !MANAGEMENT_TYPES.includes(session.user.portalType)) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const { courseId } = await ctx.params
  const institutionId = session.user.institutionId
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
      createdById: session.user.id,
    },
  })

  return NextResponse.json(post, { status: 201 })
}
