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
      studentId: string
      examTypeId: string
      marksObtained: number
      totalMarks: number
      isIncludedInFinal?: boolean
      notes?: string
    }

    if (body.marksObtained > body.totalMarks) {
      return NextResponse.json(
        { error: 'Marks obtained cannot exceed total marks' },
        { status: 400 },
      )
    }

    const pct = (body.marksObtained / body.totalMarks) * 100
    const letter = gradeLetter(pct)

    const entry = await prisma.gradeEntry.upsert({
      where: {
        studentId_subjectId_examTypeId: {
          studentId: body.studentId,
          subjectId,
          examTypeId: body.examTypeId,
        },
      },
      create: {
        institutionId,
        studentId: body.studentId,
        subjectId,
        examTypeId: body.examTypeId,
        marksObtained: body.marksObtained,
        totalMarks: body.totalMarks,
        gradeLetter: letter,
        isIncludedInFinal: body.isIncludedInFinal ?? true,
        notes: body.notes ?? null,
        source: 'MANUAL',
        enteredById: session.user.id,
      },
      update: {
        marksObtained: body.marksObtained,
        totalMarks: body.totalMarks,
        gradeLetter: letter,
        isIncludedInFinal: body.isIncludedInFinal ?? true,
        notes: body.notes ?? null,
        overriddenById: session.user.id,
      },
    })

    await prisma.auditLog.create({
      data: {
        institutionId,
        userId: session.user.id,
        action: 'GRADE_ENTRY_UPSERT',
        tableName: 'GradeEntry',
        recordId: entry.id,
        after: {
          studentId: body.studentId,
          subjectId,
          examTypeId: body.examTypeId,
          marksObtained: body.marksObtained,
          totalMarks: body.totalMarks,
        },
      },
    })

    return NextResponse.json(entry)
  } catch (err) {
    console.error('POST grade entry error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}

export async function DELETE(req: NextRequest, ctx: Ctx) {
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
      studentId: string
      examTypeId: string
    }

    const existing = await prisma.gradeEntry.findFirst({
      where: {
        studentId: body.studentId,
        subjectId,
        examTypeId: body.examTypeId,
        institutionId,
      },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Grade entry not found' },
        { status: 404 },
      )
    }

    await prisma.gradeEntry.delete({
      where: { id: existing.id },
    })

    await prisma.auditLog.create({
      data: {
        institutionId,
        userId: session.user.id,
        action: 'GRADE_ENTRY_DELETE',
        tableName: 'GradeEntry',
        recordId: existing.id,
        before: {
          studentId: body.studentId,
          subjectId,
          examTypeId: body.examTypeId,
        },
      },
    })

    return NextResponse.json({ deleted: true })
  } catch (err) {
    console.error('DELETE grade entry error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
