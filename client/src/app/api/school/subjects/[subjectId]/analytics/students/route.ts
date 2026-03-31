import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'

type RouteContext = { params: Promise<{ subjectId: string }> }

// GET /api/school/subjects/[subjectId]/analytics/students — per-student analytics
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

  const totalItems = await prisma.subjectModuleItem.count({
    where: { subjectId, isPublished: true },
  })

  // Get enrolled students
  const sectionFilter = subject.sectionId
    ? { sectionId: subject.sectionId }
    : { classYearId: subject.classYearId }

  const studentSections = await prisma.studentSection.findMany({
    where: { ...sectionFilter, institutionId, status: 'ACTIVE' },
    include: {
      student: {
        select: { id: true, firstName: true, lastName: true, rollNo: true },
      },
    },
  })

  // Get progress per student
  const progressByStudent = await prisma.studentModuleItemProgress.groupBy({
    by: ['studentId', 'status'],
    where: { subjectId },
    _count: true,
    _sum: { timeSpentSeconds: true },
  })

  // Get submission stats per student
  const submissionsByStudent = await prisma.subjectAssignmentSubmission.groupBy({
    by: ['studentId'],
    where: { assignment: { subjectId } },
    _count: true,
    _avg: { marksObtained: true },
  })

  const submissionMap = new Map(
    submissionsByStudent.map((s) => [s.studentId, {
      count: s._count,
      avgMarks: s._avg.marksObtained ? Number(s._avg.marksObtained) : null,
    }])
  )

  // Build per-student progress map
  const studentProgressMap = new Map<string, { completed: number; inProgress: number; totalTime: number }>()
  for (const row of progressByStudent) {
    const existing = studentProgressMap.get(row.studentId) ?? { completed: 0, inProgress: 0, totalTime: 0 }
    if (row.status === 'COMPLETED') existing.completed = row._count
    if (row.status === 'IN_PROGRESS') existing.inProgress = row._count
    existing.totalTime += row._sum.timeSpentSeconds ?? 0
    studentProgressMap.set(row.studentId, existing)
  }

  const analytics = studentSections.map((ss) => {
    const progress = studentProgressMap.get(ss.studentId) ?? { completed: 0, inProgress: 0, totalTime: 0 }
    const submissions = submissionMap.get(ss.studentId) ?? { count: 0, avgMarks: null }

    return {
      studentId: ss.student.id,
      firstName: ss.student.firstName,
      lastName: ss.student.lastName,
      rollNo: ss.student.rollNo,
      itemsCompleted: progress.completed,
      itemsInProgress: progress.inProgress,
      completionPercent: totalItems > 0
        ? Math.round((progress.completed / totalItems) * 100)
        : 0,
      totalTimeSeconds: progress.totalTime,
      submissionsCount: submissions.count,
      avgMarks: submissions.avgMarks,
    }
  })

  // Sort by completion descending
  analytics.sort((a, b) => b.completionPercent - a.completionPercent)

  return NextResponse.json(analytics)
}
