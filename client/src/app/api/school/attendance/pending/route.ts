import { NextResponse } from 'next/server'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  const ctx = await getSchoolContext(req, ['TEACHER'])
    if (isApiError(ctx)) return ctx
    const { institutionId } = ctx
  const today = new Date()
  const dateOnly = new Date(
    Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()),
  )

  try {
    const teacherSubjects = await prisma.subjectTeacher.findMany({
      where: { teacherId: ctx.userId },
      select: {
        subject: {
          select: {
            id: true,
            name: true,
            sectionId: true,
            section: { select: { id: true, name: true } },
            classYear: {
              select: {
                classTemplate: { select: { name: true } },
              },
            },
          },
        },
      },
    })

    const sectionIds = Array.from(
      new Set(
        teacherSubjects
          .map((ts) => ts.subject.sectionId)
          .filter(Boolean) as string[],
      ),
    )

    const markedToday = await prisma.attendance.findMany({
      where: {
        institutionId,
        sectionId: { in: sectionIds },
        date: dateOnly,
        periodNumber: null,
      },
      select: { sectionId: true },
    })

    const markedSet = new Set(markedToday.map((a) => a.sectionId))

    const pending = sectionIds
      .filter((id) => !markedSet.has(id))
      .map((id) => {
        const ts = teacherSubjects.find(
          (t) => t.subject.sectionId === id,
        )
        return {
          sectionId: id,
          sectionName: ts?.subject.section?.name ?? '',
          className: ts?.subject.classYear.classTemplate.name ?? '',
        }
      })

    return NextResponse.json({ date: dateOnly.toISOString().slice(0, 10), pending })
  } catch (err) {
    console.error('GET attendance pending error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
