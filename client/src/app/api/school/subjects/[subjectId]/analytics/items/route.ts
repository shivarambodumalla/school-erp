import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'

type RouteContext = { params: Promise<{ subjectId: string }> }

// GET /api/school/subjects/[subjectId]/analytics/items — per-item analytics
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

  // Get total enrolled students
  const sectionFilter = subject.sectionId
    ? { sectionId: subject.sectionId }
    : { classYearId: subject.classYearId }

  const totalStudents = await prisma.studentSection.count({
    where: { ...sectionFilter, institutionId, status: 'ACTIVE' },
  })

  // Get all items with progress counts
  const items = await prisma.subjectModuleItem.findMany({
    where: { subjectId, isPublished: true },
    select: {
      id: true,
      title: true,
      type: true,
      moduleId: true,
      order: true,
      _count: {
        select: { progress: true },
      },
    },
    orderBy: [{ moduleId: 'asc' }, { order: 'asc' }],
  })

  // Get completed counts per item
  const completedCounts = await prisma.studentModuleItemProgress.groupBy({
    by: ['moduleItemId'],
    where: { subjectId, status: 'COMPLETED' },
    _count: true,
  })

  const completedMap = new Map(
    completedCounts.map((c) => [c.moduleItemId, c._count])
  )

  // Get average time per item
  const avgTimes = await prisma.studentModuleItemProgress.groupBy({
    by: ['moduleItemId'],
    where: { subjectId, timeSpentSeconds: { gt: 0 } },
    _avg: { timeSpentSeconds: true },
  })

  const avgTimeMap = new Map(
    avgTimes.map((t) => [t.moduleItemId, Math.round(t._avg.timeSpentSeconds ?? 0)])
  )

  const analytics = items.map((item) => ({
    id: item.id,
    title: item.title,
    type: item.type,
    moduleId: item.moduleId,
    totalViewed: item._count.progress,
    totalCompleted: completedMap.get(item.id) ?? 0,
    completionRate: totalStudents > 0
      ? Math.round(((completedMap.get(item.id) ?? 0) / totalStudents) * 100)
      : 0,
    avgTimeSeconds: avgTimeMap.get(item.id) ?? 0,
  }))

  return NextResponse.json(analytics)
}
