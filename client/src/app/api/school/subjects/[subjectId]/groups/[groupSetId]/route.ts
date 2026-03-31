import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'

type RouteContext = { params: Promise<{ subjectId: string; groupSetId: string }> }

// DELETE /api/school/subjects/[subjectId]/groups/[groupSetId]
export async function DELETE(req: Request, ctx: RouteContext) {
  const result = await getSchoolContext(req, ['ADMIN', 'TEACHER'])
  if (isApiError(result)) return result
  const { institutionId } = result
  const { subjectId, groupSetId } = await ctx.params

  const subject = await prisma.subject.findFirst({
    where: { id: subjectId, institutionId },
  })
  if (!subject) {
    return NextResponse.json({ error: 'Subject not found' }, { status: 404 })
  }

  const groupSet = await prisma.groupSet.findFirst({
    where: { id: groupSetId, subjectId, institutionId },
  })
  if (!groupSet) {
    return NextResponse.json({ error: 'Group set not found' }, { status: 404 })
  }

  // Cascade delete handles groups and members
  await prisma.groupSet.delete({ where: { id: groupSetId } })

  return NextResponse.json({ success: true })
}
