import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'

type RouteContext = {
  params: Promise<{ subjectId: string; itemId: string; submissionId: string }>
}

// PATCH /api/school/subjects/[subjectId]/lms-assignments/[itemId]/submissions/[submissionId]/grade
export async function PATCH(req: Request, ctx: RouteContext) {
  const result = await getSchoolContext(req, ['ADMIN', 'TEACHER'])
  if (isApiError(result)) return result
  const { institutionId, userId } = result
  const { subjectId, itemId, submissionId } = await ctx.params

  const subject = await prisma.subject.findFirst({
    where: { id: subjectId, institutionId },
  })
  if (!subject) {
    return NextResponse.json({ error: 'Subject not found' }, { status: 404 })
  }

  const assignment = await prisma.subjectAssignment.findFirst({
    where: { moduleItemId: itemId, subjectId },
  })
  if (!assignment) {
    return NextResponse.json({ error: 'Assignment not found' }, { status: 404 })
  }

  const submission = await prisma.subjectAssignmentSubmission.findFirst({
    where: { id: submissionId, assignmentId: assignment.id },
  })
  if (!submission) {
    return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
  }

  const body = await req.json() as {
    marksObtained: number
    feedback?: string
    returnReason?: string
    status?: string
  }

  if (body.marksObtained === undefined) {
    return NextResponse.json({ error: 'marksObtained is required' }, { status: 400 })
  }

  if (body.marksObtained < 0 || body.marksObtained > assignment.totalMarks) {
    return NextResponse.json(
      { error: `marksObtained must be between 0 and ${assignment.totalMarks}` },
      { status: 400 }
    )
  }

  const updated = await prisma.subjectAssignmentSubmission.update({
    where: { id: submissionId },
    data: {
      marksObtained: body.marksObtained,
      feedback: body.feedback?.trim() ?? null,
      returnReason: body.returnReason?.trim() ?? null,
      status: (body.status as 'GRADED' | 'RETURNED') ?? 'GRADED',
      gradedById: userId,
      gradedAt: new Date(),
    },
  })

  return NextResponse.json(updated)
}
