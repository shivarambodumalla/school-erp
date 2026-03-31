import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'

type RouteContext = { params: Promise<{ subjectId: string; itemId: string }> }

// GET /api/school/subjects/[subjectId]/lms-assignments/[itemId]/submissions
export async function GET(req: Request, ctx: RouteContext) {
  const result = await getSchoolContext(req, ['ADMIN', 'TEACHER'])
  if (isApiError(result)) return result
  const { institutionId } = result
  const { subjectId, itemId } = await ctx.params

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

  const submissions = await prisma.subjectAssignmentSubmission.findMany({
    where: { assignmentId: assignment.id },
    include: {
      student: {
        select: { id: true, firstName: true, lastName: true, rollNo: true },
      },
    },
    orderBy: { submittedAt: 'desc' },
  })

  return NextResponse.json(submissions)
}
