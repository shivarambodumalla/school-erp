import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/server/auth'
import { prisma } from '@/lib/prisma'

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

export async function POST(req: NextRequest, ctx: Ctx) {
  const session = await auth()
  if (
    !session ||
    !['ADMIN', 'TEACHER'].includes(session.user.portalType)
  ) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const institutionId = session.user.institutionId
  const { subjectId } = await ctx.params

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
            enteredById: session.user.id,
          },
          update: {
            marksObtained: e.marksObtained,
            totalMarks: body.totalMarks,
            gradeLetter: letter,
            overriddenById: session.user.id,
          },
        })
      }),
    )

    return NextResponse.json({ saved: saved.length })
  } catch (err) {
    console.error('POST bulk grade error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
