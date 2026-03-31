import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'

type RouteContext = { params: Promise<{ subjectId: string }> }

// POST /api/school/subjects/[subjectId]/certificates/generate
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
    studentId: string
    fileUrl?: string
  }

  if (!body.studentId) {
    return NextResponse.json({ error: 'studentId is required' }, { status: 400 })
  }

  // Calculate completion percentage from progress data
  const totalItems = await prisma.subjectModuleItem.count({
    where: { subjectId, isPublished: true },
  })

  const completedItems = await prisma.studentModuleItemProgress.count({
    where: {
      subjectId,
      studentId: body.studentId,
      status: 'COMPLETED',
    },
  })

  const completionPercent = totalItems > 0
    ? Math.round((completedItems / totalItems) * 100)
    : 0

  const certificate = await prisma.subjectCertificate.upsert({
    where: {
      subjectId_studentId: { subjectId, studentId: body.studentId },
    },
    create: {
      subjectId,
      studentId: body.studentId,
      completionPercent,
      fileUrl: body.fileUrl ?? null,
      issuedById: userId,
    },
    update: {
      completionPercent,
      fileUrl: body.fileUrl ?? undefined,
      issuedById: userId,
      issuedAt: new Date(),
    },
  })

  return NextResponse.json(certificate, { status: 201 })
}
