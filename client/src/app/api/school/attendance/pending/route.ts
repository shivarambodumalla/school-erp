import { NextResponse } from 'next/server'
import { auth } from '@/server/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session || session.user.portalType !== 'TEACHER') {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const institutionId = session.user.institutionId
  const today = new Date()
  const dateOnly = new Date(
    Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()),
  )

  try {
    const teacherSubjects = await prisma.subjectTeacher.findMany({
      where: { teacherId: session.user.id },
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
