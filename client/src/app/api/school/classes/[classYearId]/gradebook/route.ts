import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/server/auth'
import { prisma } from '@/lib/prisma'

type Ctx = { params: Promise<{ classYearId: string }> }

function gradeLetter(pct: number): string {
  if (pct >= 90) return 'A+'
  if (pct >= 80) return 'A'
  if (pct >= 70) return 'B+'
  if (pct >= 60) return 'B'
  if (pct >= 50) return 'C'
  if (pct >= 40) return 'D'
  return 'F'
}

export async function GET(req: NextRequest, ctx: Ctx) {
  const session = await auth()
  if (!session || session.user.portalType !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const institutionId = session.user.institutionId
  const { classYearId } = await ctx.params
  const sectionId = req.nextUrl.searchParams.get('sectionId')

  try {
    const subjects = await prisma.subject.findMany({
      where: { classYearId, institutionId },
      select: { id: true, name: true, code: true },
      orderBy: { name: 'asc' },
    })

    const studentSections = await prisma.studentSection.findMany({
      where: {
        institutionId,
        classYearId,
        status: 'ACTIVE',
        ...(sectionId ? { sectionId } : {}),
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
        section: { select: { name: true } },
      },
      orderBy: { student: { rollNo: 'asc' } },
    })

    const gradeEntries = await prisma.gradeEntry.findMany({
      where: {
        institutionId,
        subjectId: { in: subjects.map((s) => s.id) },
      },
    })

    const entryMap = new Map<string, typeof gradeEntries>()
    for (const ge of gradeEntries) {
      const key = `${ge.studentId}:${ge.subjectId}`
      const arr = entryMap.get(key) ?? []
      arr.push(ge)
      entryMap.set(key, arr)
    }

    const students = studentSections.map((ss) => {
      let grandObtained = 0
      let grandMax = 0

      const subjectSummaries: Record<string, {
        obtained: number
        max: number
        percentage: number
        grade: string | null
      }> = {}

      for (const subj of subjects) {
        const entries = entryMap.get(
          `${ss.studentId}:${subj.id}`,
        ) ?? []
        const included = entries.filter((e) => e.isIncludedInFinal)
        const obt = included.reduce(
          (s, e) => s + Number(e.marksObtained), 0,
        )
        const max = included.reduce(
          (s, e) => s + Number(e.totalMarks), 0,
        )
        const pct = max > 0
          ? Math.round((obt / max) * 10000) / 100
          : 0

        subjectSummaries[subj.id] = {
          obtained: obt,
          max,
          percentage: pct,
          grade: max > 0 ? gradeLetter(pct) : null,
        }

        grandObtained += obt
        grandMax += max
      }

      const overallPct = grandMax > 0
        ? Math.round((grandObtained / grandMax) * 10000) / 100
        : 0

      return {
        studentId: ss.studentId,
        firstName: ss.student.firstName,
        lastName: ss.student.lastName,
        rollNo: ss.student.rollNo,
        sectionName: ss.section.name,
        subjectSummaries,
        overallPercentage: overallPct,
        overallGrade: grandMax > 0 ? gradeLetter(overallPct) : null,
      }
    })

    return NextResponse.json({ subjects, students })
  } catch (err) {
    console.error('GET class gradebook error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
