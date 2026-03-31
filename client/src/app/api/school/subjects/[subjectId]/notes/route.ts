import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'

type RouteContext = { params: Promise<{ subjectId: string }> }

// GET /api/school/subjects/[subjectId]/notes — list student's notes
export async function GET(req: Request, ctx: RouteContext) {
  const result = await getSchoolContext(req, ['STUDENT'])
  if (isApiError(result)) return result
  const { institutionId, userId } = result
  const { subjectId } = await ctx.params

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

  const notes = await prisma.studentNote.findMany({
    where: { subjectId, studentId: student.id },
    include: {
      moduleItem: { select: { id: true, title: true, moduleId: true } },
    },
    orderBy: { updatedAt: 'desc' },
  })

  return NextResponse.json(notes)
}

// POST /api/school/subjects/[subjectId]/notes — upsert a note
export async function POST(req: Request, ctx: RouteContext) {
  const result = await getSchoolContext(req, ['STUDENT'])
  if (isApiError(result)) return result
  const { institutionId, userId } = result
  const { subjectId } = await ctx.params

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

  const body = await req.json() as {
    moduleItemId: string
    content: string
  }

  if (!body.moduleItemId || !body.content?.trim()) {
    return NextResponse.json({ error: 'moduleItemId and content are required' }, { status: 400 })
  }

  const item = await prisma.subjectModuleItem.findFirst({
    where: { id: body.moduleItemId, subjectId },
  })
  if (!item) {
    return NextResponse.json({ error: 'Module item not found' }, { status: 404 })
  }

  const note = await prisma.studentNote.upsert({
    where: {
      studentId_moduleItemId: {
        studentId: student.id,
        moduleItemId: body.moduleItemId,
      },
    },
    create: {
      studentId: student.id,
      moduleItemId: body.moduleItemId,
      subjectId,
      content: body.content.trim(),
    },
    update: {
      content: body.content.trim(),
    },
  })

  return NextResponse.json(note)
}
