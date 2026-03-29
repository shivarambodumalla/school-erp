import { NextRequest, NextResponse } from 'next/server'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'
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

export async function GET(req: NextRequest, { params }: Ctx) {
  const ctx = await getSchoolContext(req, ['ADMIN', 'TEACHER'])
  if (isApiError(ctx)) return ctx
  const { institutionId } = ctx

  const { subjectId } = await params

  try {
    const subject = await prisma.subject.findFirst({
      where: { id: subjectId, institutionId },
      select: {
        id: true,
        name: true,
        code: true,
        classYearId: true,
        sectionId: true,
      },
    })
    if (!subject) {
      return NextResponse.json(
        { error: 'Subject not found' },
        { status: 404 },
      )
    }

    const examTypes = await prisma.examType.findMany({
      where: { institutionId },
      orderBy: { order: 'asc' },
    })

    const studentSections = await prisma.studentSection.findMany({
      where: {
        institutionId,
        classYearId: subject.classYearId,
        status: 'ACTIVE',
        ...(subject.sectionId
          ? { sectionId: subject.sectionId }
          : {}),
      },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            rollNo: true,
          },
        },
      },
      orderBy: { student: { rollNo: 'asc' } },
    })

    const gradeEntries = await prisma.gradeEntry.findMany({
      where: { subjectId, institutionId },
    })

    const entryMap = new Map<string, typeof gradeEntries[number]>()
    for (const ge of gradeEntries) {
      entryMap.set(`${ge.studentId}:${ge.examTypeId}`, ge)
    }

    const students = studentSections.map((ss) => {
      const grades: Record<string, {
        marksObtained: number
        totalMarks: number
        gradeLetter: string | null
        isIncludedInFinal: boolean
        notes: string | null
      } | null> = {}

      let totalObtained = 0
      let totalMax = 0

      for (const et of examTypes) {
        const entry = entryMap.get(`${ss.studentId}:${et.id}`)
        if (entry) {
          grades[et.id] = {
            marksObtained: Number(entry.marksObtained),
            totalMarks: Number(entry.totalMarks),
            gradeLetter: entry.gradeLetter,
            isIncludedInFinal: entry.isIncludedInFinal,
            notes: entry.notes,
          }
          if (entry.isIncludedInFinal) {
            totalObtained += Number(entry.marksObtained)
            totalMax += Number(entry.totalMarks)
          }
        } else {
          grades[et.id] = null
        }
      }

      const percentage = totalMax > 0
        ? Math.round((totalObtained / totalMax) * 10000) / 100
        : 0
      const overallGrade = totalMax > 0
        ? gradeLetter(percentage)
        : null

      return {
        studentId: ss.studentId,
        firstName: ss.student.firstName,
        lastName: ss.student.lastName,
        rollNo: ss.student.rollNo,
        grades,
        totalObtained,
        totalMax,
        percentage,
        overallGrade,
        rank: 0,
      }
    })

    students.sort((a, b) => b.percentage - a.percentage)
    let rank = 0
    let prevPct = -1
    for (const s of students) {
      if (s.totalMax > 0) {
        rank = s.percentage !== prevPct ? rank + 1 : rank
        s.rank = rank
        prevPct = s.percentage
      }
    }

    return NextResponse.json({ subject, examTypes, students })
  } catch (err) {
    console.error('GET gradebook error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
