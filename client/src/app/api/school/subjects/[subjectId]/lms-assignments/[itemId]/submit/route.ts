import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'

type RouteContext = { params: Promise<{ subjectId: string; itemId: string }> }

// POST /api/school/subjects/[subjectId]/lms-assignments/[itemId]/submit
export async function POST(req: Request, ctx: RouteContext) {
  const result = await getSchoolContext(req, ['STUDENT'])
  if (isApiError(result)) return result
  const { institutionId, userId } = result
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

  const student = await prisma.student.findFirst({
    where: { userId, institutionId },
  })
  if (!student) {
    return NextResponse.json({ error: 'Student not found' }, { status: 404 })
  }

  // Check existing submissions count
  const existingCount = await prisma.subjectAssignmentSubmission.count({
    where: { assignmentId: assignment.id, studentId: student.id },
  })

  if (existingCount >= assignment.maxAttempts) {
    return NextResponse.json(
      { error: 'Maximum attempts reached' },
      { status: 400 }
    )
  }

  const now = new Date()
  const isLate = now > assignment.dueDate

  if (isLate && !assignment.allowLateSubmission) {
    return NextResponse.json(
      { error: 'Late submissions are not allowed' },
      { status: 400 }
    )
  }

  const body = await req.json() as {
    fileUrls?: string[]
    textContent?: string
  }

  if (!body.fileUrls?.length && !body.textContent?.trim()) {
    return NextResponse.json(
      { error: 'Either fileUrls or textContent is required' },
      { status: 400 }
    )
  }

  const submission = await prisma.subjectAssignmentSubmission.create({
    data: {
      assignmentId: assignment.id,
      studentId: student.id,
      attempt: existingCount + 1,
      fileUrls: body.fileUrls ?? [],
      textContent: body.textContent?.trim() ?? null,
      isLate,
      status: isLate ? 'LATE' : 'SUBMITTED',
    },
  })

  return NextResponse.json(submission, { status: 201 })
}
