import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'

type RouteContext = { params: Promise<{ subjectId: string }> }

// GET /api/school/subjects/[subjectId]/discussions — list all discussions
export async function GET(req: Request, ctx: RouteContext) {
  const result = await getSchoolContext(req, ['ADMIN', 'TEACHER', 'STUDENT'])
  if (isApiError(result)) return result
  const { institutionId } = result
  const { subjectId } = await ctx.params

  const subject = await prisma.subject.findFirst({
    where: { id: subjectId, institutionId },
  })
  if (!subject) {
    return NextResponse.json({ error: 'Subject not found' }, { status: 404 })
  }

  const discussions = await prisma.subjectDiscussion.findMany({
    where: { subjectId },
    include: {
      moduleItem: { select: { id: true, title: true, moduleId: true } },
      _count: { select: { replies: true } },
    },
    orderBy: { moduleItem: { createdAt: 'desc' } },
  })

  return NextResponse.json(discussions)
}
