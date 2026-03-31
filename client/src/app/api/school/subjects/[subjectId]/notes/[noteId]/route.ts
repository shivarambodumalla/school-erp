import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'

type RouteContext = { params: Promise<{ subjectId: string; noteId: string }> }

// DELETE /api/school/subjects/[subjectId]/notes/[noteId]
export async function DELETE(req: Request, ctx: RouteContext) {
  const result = await getSchoolContext(req, ['STUDENT'])
  if (isApiError(result)) return result
  const { institutionId, userId } = result
  const { subjectId, noteId } = await ctx.params

  const subject = await prisma.subject.findFirst({
    where: { id: subjectId, institutionId },
  })
  if (!subject) {
    return NextResponse.json({ error: 'Subject not found' }, { status: 404 })
  }

  const student = await prisma.student.findFirst({
    where: { userId, institutionId },
  })
  if (!student) {
    return NextResponse.json({ error: 'Student not found' }, { status: 404 })
  }

  const note = await prisma.studentNote.findFirst({
    where: { id: noteId, studentId: student.id, subjectId },
  })
  if (!note) {
    return NextResponse.json({ error: 'Note not found' }, { status: 404 })
  }

  await prisma.studentNote.delete({ where: { id: noteId } })

  return NextResponse.json({ success: true })
}
