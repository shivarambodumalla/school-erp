import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'

type RouteContext = { params: Promise<{ subjectId: string; resourceId: string }> }

// POST /api/school/subjects/[subjectId]/resources/[resourceId]/download
// Increment download count and return the file URL
export async function POST(req: Request, ctx: RouteContext) {
  const result = await getSchoolContext(req, ['ADMIN', 'TEACHER', 'STUDENT'])
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

  const updated = await prisma.subjectResource.update({
    where: { id: resourceId },
    data: { downloadCount: { increment: 1 } },
  })

  return NextResponse.json({ fileUrl: updated.fileUrl, downloadCount: updated.downloadCount })
}
