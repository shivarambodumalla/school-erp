import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'

type RouteContext = { params: Promise<{ subjectId: string }> }

// GET /api/school/subjects/[subjectId]/lms-assignments — list all subject assignments
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

  const assignments = await prisma.subjectAssignment.findMany({
    where: { subjectId },
    include: {
      moduleItem: {
        select: { id: true, title: true, moduleId: true, type: true },
      },
      _count: { select: { submissions: true } },
    },
    orderBy: { dueDate: 'desc' },
  })

  return NextResponse.json(assignments)
}
