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

  const studentSection = await prisma.studentSection.findFirst({
    where: { studentId: student.id, institutionId, status: 'ACTIVE' },
    include: {
      section: true,
      classYear: { include: { classTemplate: true, academicYear: true } },
    },
  })
  if (!studentSection) {
    return NextResponse.json({ error: 'No active enrollment' }, { status: 404 })
  }

  const subjects = await prisma.subject.findMany({
    where: { classYearId: studentSection.classYearId, institutionId },
    include: {
      teachers: { include: { user: { select: { email: true } } } },
    },
    orderBy: { name: 'asc' },
  })

  return NextResponse.json({
    student: {
      id: student.id,
      firstName: student.firstName,
      lastName: student.lastName,
    },
    classInfo: {
      className: studentSection.classYear.classTemplate.name,
      sectionName: studentSection.section.name,
      sectionId: studentSection.sectionId,
      classYearId: studentSection.classYearId,
      academicYear: studentSection.classYear.academicYear.name,
    },
    subjects: subjects.map((s) => ({
      id: s.id,
      name: s.name,
      code: s.code,
      weeklyPeriods: s.weeklyPeriods,
      hasOnlineContent: s.hasOnlineContent,
      teacher: s.teachers[0]?.user.email ?? null,
    })),
  })
}
