import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'

type RouteContext = { params: Promise<{ subjectId: string }> }

// GET /api/school/subjects/[subjectId]/progress — get all progress for current student
export async function GET(req: Request, ctx: RouteContext) {
  const result = await getSchoolContext(req, ['ADMIN', 'TEACHER', 'STUDENT'])
  if (isApiError(result)) return result
  const { institutionId, userId, portalType } = result
  const { subjectId } = await ctx.params

  const subject = await prisma.subject.findFirst({
    where: { id: subjectId, institutionId },
  })
  if (!subject) {
    return NextResponse.json({ error: 'Subject not found' }, { status: 404 })
  }

  const url = new URL(req.url)
  const studentId = url.searchParams.get('studentId')

  // Students can only see their own progress
  if (portalType === 'STUDENT') {
    const student = await prisma.student.findFirst({
      where: { userId, institutionId },
    })
    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })
    }

    const progress = await prisma.studentModuleItemProgress.findMany({
      where: { subjectId, studentId: student.id },
      include: { moduleItem: { select: { id: true, title: true, moduleId: true } } },
    })

    return NextResponse.json(progress)
  }

  // Teachers/admins: optionally filter by studentId, or return all
  const where: { subjectId: string; studentId?: string } = { subjectId }
  if (studentId) where.studentId = studentId

  const progress = await prisma.studentModuleItemProgress.findMany({
    where,
    include: {
      moduleItem: { select: { id: true, title: true, moduleId: true } },
      student: { select: { id: true, firstName: true, lastName: true } },
    },
  })

  return NextResponse.json(progress)
}

// POST /api/school/subjects/[subjectId]/progress — upsert progress
export async function POST(req: Request, ctx: RouteContext) {
  const result = await getSchoolContext(req, ['STUDENT'])
  if (isApiError(result)) return result
  const { institutionId, userId } = result
  const { subjectId } = await ctx.params

  const subject = await prisma.subject.findFirst({
    where: { id: subjectId, institutionId },
  })
  if (!subject) {
    return NextResponse.json({ error: 'Subject not found' }, { status: 404 })
  }

  const student = await prisma.student.findFirst({
    where: { userId, institutionId },
  })
  if (!student) {
    return NextResponse.json({ error: 'Student not found' }, { status: 404 })
  }

  const body = await req.json() as {
    moduleItemId: string
    status?: string
    timeSpentSeconds?: number
  }

  if (!body.moduleItemId) {
    return NextResponse.json({ error: 'moduleItemId is required' }, { status: 400 })
  }

  // Verify the item belongs to this subject
  const item = await prisma.subjectModuleItem.findFirst({
    where: { id: body.moduleItemId, subjectId },
  })
  if (!item) {
    return NextResponse.json({ error: 'Module item not found' }, { status: 404 })
  }

  const status = (body.status as 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED') ?? 'IN_PROGRESS'
  const completedAt = status === 'COMPLETED' ? new Date() : undefined

  const progress = await prisma.studentModuleItemProgress.upsert({
    where: {
      studentId_moduleItemId: {
        studentId: student.id,
        moduleItemId: body.moduleItemId,
      },
    },
    create: {
      studentId: student.id,
      moduleItemId: body.moduleItemId,
      subjectId,
      status,
      timeSpentSeconds: body.timeSpentSeconds ?? 0,
      lastAccessedAt: new Date(),
      completedAt: completedAt ?? null,
    },
    update: {
      status,
      lastAccessedAt: new Date(),
      ...(body.timeSpentSeconds !== undefined && {
        timeSpentSeconds: { increment: body.timeSpentSeconds },
      }),
      ...(completedAt && { completedAt }),
    },
  })

  return NextResponse.json(progress)
}
