import { NextResponse } from 'next/server'
import { auth } from '@/server/auth'
import { prisma } from '@/lib/prisma'

const MANAGEMENT_TYPES = ['ADMIN', 'TEACHER', 'INSTRUCTOR']

export async function GET(req: Request) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const institutionId = session.user.institutionId
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
  const session = await auth()
  if (!session || !MANAGEMENT_TYPES.includes(session.user.portalType)) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const institutionId = session.user.institutionId
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
      instructorId: session.user.id,
      targetType: (body.targetType as 'ALL' | 'CLASS' | 'SECTION') ?? 'ALL',
      targetIds: body.targetIds ?? [],
      maxEnrollment: body.maxEnrollment ?? null,
      status: 'DRAFT',
    },
  })

  return NextResponse.json(course, { status: 201 })
}
