import { NextResponse } from 'next/server'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  const ctx = await getSchoolContext(req, ['STUDENT'])
    if (isApiError(ctx)) return ctx
    const { institutionId } = ctx

  const student = await prisma.student.findFirst({
    where: { userId: ctx.userId, institutionId },
  })
  if (!student) {
    return NextResponse.json({ error: 'Student not found' }, { status: 404 })
  }

  const section = await prisma.studentSection.findFirst({
    where: { studentId: student.id, institutionId, status: 'ACTIVE' },
  })
  if (!section) {
    return NextResponse.json({ error: 'No active enrollment' }, { status: 404 })
  }

  const homework = await prisma.homeworkLog.findMany({
    where: { institutionId, sectionId: section.sectionId },
    include: {
      subject: { select: { name: true } },
      completions: { where: { studentId: student.id } },
    },
    orderBy: { dueDate: 'asc' },
  })

  return NextResponse.json({
    homework: homework.map((h) => ({
      id: h.id,
      title: h.title,
      description: h.description,
      dueDate: h.dueDate,
      subjectName: h.subject.name,
      isDone: h.completions[0]?.isDone ?? false,
    })),
  })
}

export async function POST(req: Request) {
  const ctx = await getSchoolContext(req, ['STUDENT'])
    if (isApiError(ctx)) return ctx
    const { institutionId } = ctx
  const body = (await req.json()) as { homeworkId: string; isDone: boolean }

  const student = await prisma.student.findFirst({
    where: { userId: ctx.userId, institutionId },
  })
  if (!student) {
    return NextResponse.json({ error: 'Student not found' }, { status: 404 })
  }

  const completion = await prisma.homeworkCompletion.upsert({
    where: {
      homeworkId_studentId: {
        homeworkId: body.homeworkId,
        studentId: student.id,
      },
    },
    create: {
      homeworkId: body.homeworkId,
      studentId: student.id,
      isDone: body.isDone,
      markedAt: new Date(),
    },
    update: {
      isDone: body.isDone,
      markedAt: new Date(),
    },
  })

  return NextResponse.json({ id: completion.id, isDone: completion.isDone })
}
