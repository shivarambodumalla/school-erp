import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'

type RouteContext = { params: Promise<{ subjectId: string }> }

// POST /api/school/subjects/[subjectId]/export — create export job
export async function POST(req: Request, ctx: RouteContext) {
  const result = await getSchoolContext(req, ['ADMIN', 'TEACHER'])
  if (isApiError(result)) return result
  const { institutionId, userId } = result
  const { subjectId } = await ctx.params

  const subject = await prisma.subject.findFirst({
    where: { id: subjectId, institutionId },
  })
  if (!subject) {
    return NextResponse.json({ error: 'Subject not found' }, { status: 404 })
  }

  const job = await prisma.subjectExportJob.create({
    data: {
      subjectId,
      institutionId,
      status: 'PENDING',
      exportedById: userId,
    },
  })

  // In a production system, this would trigger a background job.
  // For now, mark as COMPLETE immediately with a placeholder URL.
  const updated = await prisma.subjectExportJob.update({
    where: { id: job.id },
    data: {
      status: 'COMPLETE',
      fileUrl: `/exports/${job.id}.json`,
      completedAt: new Date(),
    },
  })

  return NextResponse.json(updated, { status: 201 })
}
