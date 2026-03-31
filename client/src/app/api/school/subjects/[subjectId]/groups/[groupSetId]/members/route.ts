import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'

type RouteContext = { params: Promise<{ subjectId: string; groupSetId: string }> }

// PATCH /api/school/subjects/[subjectId]/groups/[groupSetId]/members
// Move a student between groups
export async function PATCH(req: Request, ctx: RouteContext) {
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

  const body = await req.json() as {
    studentId: string
    fromGroupId: string
    toGroupId: string
  }

  if (!body.studentId || !body.fromGroupId || !body.toGroupId) {
    return NextResponse.json(
      { error: 'studentId, fromGroupId, and toGroupId are required' },
      { status: 400 }
    )
  }

  // Verify both groups belong to this groupSet
  const [fromGroup, toGroup] = await Promise.all([
    prisma.subjectGroup.findFirst({ where: { id: body.fromGroupId, groupSetId } }),
    prisma.subjectGroup.findFirst({ where: { id: body.toGroupId, groupSetId } }),
  ])

  if (!fromGroup || !toGroup) {
    return NextResponse.json({ error: 'Group not found' }, { status: 404 })
  }

  // Remove from old group, add to new group
  await prisma.$transaction([
    prisma.subjectGroupMember.deleteMany({
      where: { groupId: body.fromGroupId, studentId: body.studentId },
    }),
    prisma.subjectGroupMember.create({
      data: { groupId: body.toGroupId, studentId: body.studentId },
    }),
  ])

  return NextResponse.json({ success: true })
}
