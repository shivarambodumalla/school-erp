import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'

type RouteContext = { params: Promise<{ subjectId: string; moduleId: string }> }

// POST /api/school/subjects/[subjectId]/modules/[moduleId]/items/reorder
export async function POST(req: Request, ctx: RouteContext) {
  const result = await getSchoolContext(req, ['ADMIN', 'TEACHER'])
  if (isApiError(result)) return result
  const { institutionId } = result
  const { subjectId, moduleId } = await ctx.params

  const subject = await prisma.subject.findFirst({
    where: { id: subjectId, institutionId },
  })
  if (!subject) {
    return NextResponse.json({ error: 'Subject not found' }, { status: 404 })
  }

  const mod = await prisma.subjectModule.findFirst({
    where: { id: moduleId, subjectId },
  })
  if (!mod) {
    return NextResponse.json({ error: 'Module not found' }, { status: 404 })
  }

  const body = await req.json() as { orderedIds: string[] }

  if (!Array.isArray(body.orderedIds) || body.orderedIds.length === 0) {
    return NextResponse.json({ error: 'orderedIds array is required' }, { status: 400 })
  }

  await prisma.$transaction(
    body.orderedIds.map((id, index) =>
      prisma.subjectModuleItem.updateMany({
        where: { id, moduleId, subjectId },
        data: { order: index },
      })
    )
  )

  return NextResponse.json({ success: true })
}
