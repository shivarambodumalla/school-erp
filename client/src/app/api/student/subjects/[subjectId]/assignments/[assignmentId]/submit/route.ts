import { NextResponse } from 'next/server'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'

interface RouteContext {
  params: Promise<{ subjectId: string; assignmentId: string }>
}

export async function POST(req: Request,routeCtx: RouteContext) {
  const ctx = await getSchoolContext(req, ['STUDENT'])
    if (isApiError(ctx)) return ctx
    const { institutionId } = ctx

  const { assignmentId } = await routeCtx.params
  const body = (await req.json()) as { fileUrl?: string; notes?: string }

  const student = await prisma.student.findFirst({
    where: { userId: ctx.userId, institutionId },
  })
  if (!student) {
    return NextResponse.json({ error: 'Student not found' }, { status: 404 })
  }

  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId },
  })
  if (!assignment) {
    return NextResponse.json({ error: 'Assignment not found' }, { status: 404 })
  }

  const existing = await prisma.assignmentSubmission.findFirst({
    where: {
      assignmentId,
      studentId: student.id,
    },
  })
  if (existing) {
    return NextResponse.json({ error: 'Already submitted' }, { status: 409 })
  }

  const now = new Date()
  const isLate = now > assignment.dueDate

  if (isLate && !assignment.allowLateSubmission) {
    return NextResponse.json({ error: 'Past due date' }, { status: 400 })
  }

  const submission = await prisma.assignmentSubmission.create({
    data: {
      assignmentId,
      studentId: student.id,
      fileUrl: body.fileUrl ?? null,
      notes: body.notes ?? null,
      isLate,
      status: isLate ? 'LATE' : 'SUBMITTED',
    },
  })

  return NextResponse.json({
    submissionId: submission.id,
    isLate,
  })
}
