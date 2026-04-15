import { NextResponse } from 'next/server'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'

const DEFAULT_BADGE_POINTS: Record<string, number> = {
  STAR: 10,
  THUMBS_UP: 5,
  TROPHY: 25,
  HEART: 10,
  LIGHTNING: 15,
  CROWN: 50,
}

export async function GET(req: Request) {
  const ctx = await getSchoolContext(req, ['ADMIN', 'TEACHER'])
  if (isApiError(ctx)) return ctx
  const { institutionId } = ctx

  const url = new URL(req.url)
  const studentId = url.searchParams.get('studentId')
  const teacherId = url.searchParams.get('teacherId')
  const badge = url.searchParams.get('badge')
  const page = Math.max(1, Number(url.searchParams.get('page') ?? '1'))
  const take = Math.min(50, Math.max(1, Number(url.searchParams.get('take') ?? '20')))
  const skip = (page - 1) * take

  const where: Record<string, unknown> = { institutionId }
  if (studentId) where.studentId = studentId
  if (teacherId) where.teacherId = teacherId
  if (badge) where.badgeType = badge

  const [kudos, total] = await Promise.all([
    prisma.kudos.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      include: {
        student: { select: { id: true, firstName: true, lastName: true, photoUrl: true } },
        teacher: { select: { id: true, firstName: true, lastName: true } },
      },
    }),
    prisma.kudos.count({ where }),
  ])

  return NextResponse.json({ kudos, total, page, take })
}

export async function POST(req: Request) {
  const ctx = await getSchoolContext(req, ['ADMIN', 'TEACHER'])
  if (isApiError(ctx)) return ctx
  const { institutionId } = ctx

  // Resolve the staff record for the logged-in user
  const staff = await prisma.staff.findFirst({
    where: { institutionId, userId: ctx.userId, status: 'ACTIVE' },
    select: { id: true },
  })
  if (!staff) {
    return NextResponse.json({ error: 'Staff record not found' }, { status: 404 })
  }

  const body = await req.json() as {
    studentId?: string
    badgeType?: string
    title?: string
    description?: string
  }

  const { studentId, badgeType, title, description } = body

  if (!studentId || !badgeType || !title) {
    return NextResponse.json(
      { error: 'studentId, badgeType, and title are required' },
      { status: 400 },
    )
  }

  // Validate student belongs to this institution
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: { id: true, institutionId: true },
  })
  if (!student || student.institutionId !== institutionId) {
    return NextResponse.json({ error: 'Student not found' }, { status: 404 })
  }

  // Look up badge points from config or use defaults
  let badgePoints = DEFAULT_BADGE_POINTS
  const config = await prisma.kudosConfig.findUnique({
    where: { institutionId },
  })
  if (config?.badgePoints && typeof config.badgePoints === 'object') {
    badgePoints = { ...DEFAULT_BADGE_POINTS, ...(config.badgePoints as Record<string, number>) }
  }

  const points = badgePoints[badgeType] ?? 5

  const kudos = await prisma.kudos.create({
    data: {
      institutionId,
      studentId,
      teacherId: staff.id,
      badgeType: badgeType as 'STAR' | 'THUMBS_UP' | 'TROPHY' | 'HEART' | 'LIGHTNING' | 'CROWN',
      title,
      description: description || null,
      points,
    },
    include: {
      student: { select: { id: true, firstName: true, lastName: true } },
      teacher: { select: { id: true, firstName: true, lastName: true } },
    },
  })

  return NextResponse.json(kudos, { status: 201 })
}
