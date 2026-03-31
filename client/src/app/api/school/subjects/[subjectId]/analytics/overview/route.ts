import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'

type RouteContext = { params: Promise<{ subjectId: string }> }

// GET /api/school/subjects/[subjectId]/analytics/overview
export async function GET(req: Request, ctx: RouteContext) {
  const result = await getSchoolContext(req, ['ADMIN', 'TEACHER'])
  if (isApiError(result)) return result
  const { institutionId } = result
  const { subjectId } = await ctx.params

  const subject = await prisma.subject.findFirst({
    where: { id: subjectId, institutionId },
    select: { id: true, classYearId: true, sectionId: true },
  })
  if (!subject) {
    return NextResponse.json({ error: 'Subject not found' }, { status: 404 })
  }

  // Count total module items
  const totalItems = await prisma.subjectModuleItem.count({
    where: { subjectId, isPublished: true },
  })

  // Count students enrolled via StudentSection
  const sectionFilter = subject.sectionId
    ? { sectionId: subject.sectionId }
    : { classYearId: subject.classYearId }

  const totalStudents = await prisma.studentSection.count({
    where: { ...sectionFilter, institutionId, status: 'ACTIVE' },
  })

  // Progress aggregation
  const progressCounts = await prisma.studentModuleItemProgress.groupBy({
    by: ['status'],
    where: { subjectId },
    _count: true,
  })

  const completedCount = progressCounts.find((p) => p.status === 'COMPLETED')?._count ?? 0
  const inProgressCount = progressCounts.find((p) => p.status === 'IN_PROGRESS')?._count ?? 0
  const totalPossible = totalStudents * totalItems

  const averageCompletion = totalPossible > 0
    ? Math.round((completedCount / totalPossible) * 100)
    : 0

  // Assignment stats
  const assignmentCount = await prisma.subjectAssignment.count({
    where: { subjectId },
  })

  const submissionCount = await prisma.subjectAssignmentSubmission.count({
    where: { assignment: { subjectId } },
  })

  const gradedCount = await prisma.subjectAssignmentSubmission.count({
    where: { assignment: { subjectId }, status: 'GRADED' },
  })

  // Discussion stats
  const discussionCount = await prisma.subjectDiscussion.count({
    where: { subjectId },
  })

  const replyCount = await prisma.subjectDiscussionReply.count({
    where: { subjectId },
  })

  // Announcement count
  const announcementCount = await prisma.subjectAnnouncement.count({
    where: { subjectId, institutionId },
  })

  return NextResponse.json({
    totalStudents,
    totalItems,
    averageCompletion,
    progressBreakdown: {
      completed: completedCount,
      inProgress: inProgressCount,
      notStarted: totalPossible - completedCount - inProgressCount,
    },
    assignments: {
      total: assignmentCount,
      submissions: submissionCount,
      graded: gradedCount,
    },
    discussions: {
      total: discussionCount,
      replies: replyCount,
    },
    announcements: announcementCount,
  })
}
