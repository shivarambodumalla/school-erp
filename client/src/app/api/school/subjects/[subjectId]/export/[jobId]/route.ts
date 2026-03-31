import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'

type RouteContext = { params: Promise<{ subjectId: string; jobId: string }> }

// GET /api/school/subjects/[subjectId]/export/[jobId] — check export status
export async function GET(req: Request, ctx: RouteContext) {
  const result = await getSchoolContext(req, ['ADMIN', 'TEACHER'])
  if (isApiError(result)) return result
  const { institutionId } = result
  const { subjectId, jobId } = await ctx.params

  const subject = await prisma.subject.findFirst({
    where: { id: subjectId, institutionId },
  })
  if (!subject) {
    return NextResponse.json({ error: 'Subject not found' }, { status: 404 })
  }

  const job = await prisma.subjectExportJob.findFirst({
    where: { id: jobId, subjectId, institutionId },
  })
  if (!job) {
    return NextResponse.json({ error: 'Export job not found' }, { status: 404 })
  }

  return NextResponse.json(job)
}
