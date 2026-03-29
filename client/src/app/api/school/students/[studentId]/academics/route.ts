import { NextResponse } from 'next/server'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: Request,
  { params }: { params: { studentId: string } },
) {
  const ctx = await getSchoolContext(req, ['ADMIN', 'TEACHER'])
    if (isApiError(ctx)) return ctx
    const { institutionId } = ctx

  const student = await prisma.student.findUnique({
    where: { id: params.studentId },
    select: {
      id: true,
      institutionId: true,
      sections: {
        where: { status: 'ACTIVE' },
        select: {
          section: { select: { id: true, name: true } },
          classYear: {
            select: {
              id: true,
              academicYearId: true,
              classTemplate: { select: { name: true } },
            },
          },
        },
        take: 1,
      },
    },
  })

  if (!student || student.institutionId !== institutionId) {
    return NextResponse.json({ error: 'Student not found' }, { status: 404 })
  }

  // Determine academic year (from query param or student's active section)
  const { searchParams } = new URL(req.url)
  const activeSection = student.sections[0]
  const yearId = searchParams.get('academicYearId') ?? activeSection?.classYear.academicYearId ?? ''

  // Fetch academic years for the institution
  const academicYears = await prisma.academicYear.findMany({
    where: { institutionId },
    orderBy: { startDate: 'desc' },
    select: { id: true, name: true, isCurrent: true },
  })

  const selectedYear = academicYears.find(y => y.id === yearId) ?? academicYears[0]

  // Attendance for the year
  const yearRecord = await prisma.academicYear.findUnique({
    where: { id: selectedYear?.id ?? '' },
    select: { startDate: true, endDate: true },
  })

  const attendanceRecords = yearRecord
    ? await prisma.attendance.groupBy({
        by: ['status'],
        where: {
          studentId: student.id,
          institutionId,
          date: { gte: yearRecord.startDate, lte: yearRecord.endDate },
        },
        _count: true,
      })
    : []

  const attMap: Record<string, number> = {}
  for (const row of attendanceRecords) {
    attMap[row.status] = row._count
  }
  const present = attMap['PRESENT'] ?? 0
  const absent = attMap['ABSENT'] ?? 0
  const late = attMap['LATE'] ?? 0
  const halfDay = attMap['HALF_DAY'] ?? 0
  const excused = attMap['EXCUSED'] ?? 0
  const total = present + absent + late + halfDay + excused
  const pct = total > 0 ? Math.round(((present + late + halfDay) / total) * 100) : 100

  const attendance = { present, absent, late, halfDay, excused, total, pct }

  // Grades — model doesn't exist yet, return empty
  const gradesByExam: unknown[] = []

  // Courses — model doesn't exist yet, return empty
  const courses: unknown[] = []

  return NextResponse.json({
    academicYears: academicYears.map(y => ({ id: y.id, name: y.name })),
    selectedYear: selectedYear
      ? { id: selectedYear.id, name: selectedYear.name }
      : null,
    classInfo: {
      className: activeSection?.classYear.classTemplate.name ?? '',
      sectionName: activeSection?.section.name ?? '',
    },
    attendance,
    gradesByExam,
    courses,
  })
}
