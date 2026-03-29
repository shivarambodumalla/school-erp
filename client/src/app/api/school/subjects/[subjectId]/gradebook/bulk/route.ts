import { NextRequest, NextResponse } from 'next/server'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'
import { sendNotifications } from '@/lib/notifications'

type Ctx = { params: Promise<{ subjectId: string }> }

function gradeLetter(pct: number): string {
  if (pct >= 90) return 'A+'
  if (pct >= 80) return 'A'
  if (pct >= 70) return 'B+'
  if (pct >= 60) return 'B'
  if (pct >= 50) return 'C'
  if (pct >= 40) return 'D'
  return 'F'
}

interface BulkEntry {
  studentId: string
  marksObtained: number
}

export async function POST(req: NextRequest, { params }: Ctx) {
  const ctx = await getSchoolContext(req, ['ADMIN', 'TEACHER'])
  if (isApiError(ctx)) return ctx
  const { institutionId } = ctx

  const { subjectId } = await params

  try {
    const body = await req.json() as {
      examTypeId: string
      totalMarks: number
      entries: BulkEntry[]
    }

    if (!body.examTypeId || !body.totalMarks || !body.entries?.length) {
      return NextResponse.json(
        { error: 'examTypeId, totalMarks, and entries are required' },
        { status: 400 },
      )
    }

    for (const e of body.entries) {
      if (e.marksObtained > body.totalMarks) {
        return NextResponse.json(
          { error: `Marks exceed total for student ${e.studentId}` },
          { status: 400 },
        )
      }
    }

    const saved = await prisma.$transaction(
      body.entries.map((e) => {
        const pct = (e.marksObtained / body.totalMarks) * 100
        const letter = gradeLetter(pct)
        return prisma.gradeEntry.upsert({
          where: {
            studentId_subjectId_examTypeId: {
              studentId: e.studentId,
              subjectId,
              examTypeId: body.examTypeId,
            },
          },
          create: {
            institutionId,
            studentId: e.studentId,
            subjectId,
            examTypeId: body.examTypeId,
            marksObtained: e.marksObtained,
            totalMarks: body.totalMarks,
            gradeLetter: letter,
            source: 'MANUAL',
            enteredById: ctx.userId,
          },
          update: {
            marksObtained: e.marksObtained,
            totalMarks: body.totalMarks,
            gradeLetter: letter,
            overriddenById: ctx.userId,
          },
        })
      }),
    )

    // Notify students about published grades
    try {
      const studentIds = body.entries.map(e => e.studentId)
      const students = await prisma.student.findMany({
        where: { id: { in: studentIds }, userId: { not: null } },
        select: { userId: true },
      })
      const studentUserIds = students.map(s => s.userId).filter(Boolean) as string[]
      if (studentUserIds.length > 0) {
        await sendNotifications({
          institutionId,
          userIds: studentUserIds,
          type: 'GRADE_PUBLISHED',
          title: 'Grades published',
          body: `Your grades have been published.`,
        })
      }
    } catch (notifErr) {
      console.error('[Notifications] grade publish error:', notifErr)
    }

    return NextResponse.json({ saved: saved.length })
  } catch (err) {
    console.error('POST bulk grade error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
