import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'

type RouteContext = { params: Promise<{ subjectId: string; resourceId: string }> }

// DELETE /api/school/subjects/[subjectId]/resources/[resourceId]
export async function DELETE(req: Request, ctx: RouteContext) {
  const result = await getSchoolContext(req, ['ADMIN', 'TEACHER'])
  if (isApiError(result)) return result
  const { institutionId } = result
  const { subjectId, resourceId } = await ctx.params

  const subject = await prisma.subject.findFirst({
    where: { id: subjectId, institutionId },
  })
  if (!subject) {
    return NextResponse.json({ error: 'Subject not found' }, { status: 404 })
  }

  const resource = await prisma.subjectResource.findFirst({
    where: { id: resourceId, subjectId, institutionId },
  })
  if (!resource) {
    return NextResponse.json({ error: 'Resource not found' }, { status: 404 })
  }

  await prisma.subjectResource.delete({ where: { id: resourceId } })

  return NextResponse.json({ success: true })
}
