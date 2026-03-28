import { NextResponse } from 'next/server'
import { auth } from '@/server/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session || session.user.portalType !== 'STUDENT') {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const institutionId = session.user.institutionId

  const student = await prisma.student.findFirst({
    where: { userId: session.user.id, institutionId },
  })
  if (!student) {
    return NextResponse.json({ error: 'Student not found' }, { status: 404 })
  }

  const entries = await prisma.gradeEntry.findMany({
    where: { studentId: student.id, institutionId },
    include: {
      subject: { select: { name: true } },
      examType: { select: { name: true, shortName: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  const bySubject: Record<string, {
    subjectName: string
    exams: { examName: string; obtained: number; total: number }[]
  }> = {}

  let totalObtained = 0
  let totalMax = 0

  for (const e of entries) {
    if (!bySubject[e.subjectId]) {
      bySubject[e.subjectId] = { subjectName: e.subject.name, exams: [] }
    }
    const obtained = Number(e.marksObtained)
    const total = Number(e.totalMarks)
    bySubject[e.subjectId].exams.push({
      examName: e.examType.shortName,
      obtained,
      total,
    })
    totalObtained += obtained
    totalMax += total
  }

  const overallPercent = totalMax > 0
    ? Math.round((totalObtained / totalMax) * 100)
    : 0

  return NextResponse.json({
    overallPercent,
    subjects: Object.values(bySubject),
  })
}
