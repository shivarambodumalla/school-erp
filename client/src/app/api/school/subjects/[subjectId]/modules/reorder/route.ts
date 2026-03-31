import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'

type RouteContext = { params: Promise<{ subjectId: string }> }

// POST /api/school/subjects/[subjectId]/modules/reorder
export async function POST(req: Request, ctx: RouteContext) {
  const result = await getSchoolContext(req, ['ADMIN', 'TEACHER'])
  if (isApiError(result)) return result
  const { institutionId } = result
  const { subjectId } = await ctx.params

  const subject = await prisma.subject.findFirst({
    where: { id: subjectId, institutionId },
  })
  if (!subject) {
    return NextResponse.json({ error: 'Subject not found' }, { status: 404 })
  }

  const body = await req.json() as { orderedIds: string[] }

  if (!Array.isArray(body.orderedIds) || body.orderedIds.length === 0) {
    return NextResponse.json({ error: 'orderedIds array is required' }, { status: 400 })
  }

  await prisma.$transaction(
    body.orderedIds.map((id, index) =>
      prisma.subjectModule.updateMany({
        where: { id, subjectId },
        data: { order: index },
      })
    )
  )

  return NextResponse.json({ success: true })
}
