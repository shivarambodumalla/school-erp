import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/server/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const institutionId = session.user.institutionId
  const sp = req.nextUrl.searchParams
  const sectionId = sp.get('sectionId')
  const studentId = sp.get('studentId')
  const month = Number(sp.get('month') ?? new Date().getMonth() + 1)
  const year = Number(sp.get('year') ?? new Date().getFullYear())

  if (!sectionId && !studentId) {
    return NextResponse.json(
      { error: 'sectionId or studentId is required' },
      { status: 400 },
    )
  }

  try {
    const startDate = new Date(Date.UTC(year, month - 1, 1))
    const endDate = new Date(Date.UTC(year, month, 0))

    if (sectionId) {
      const records = await prisma.attendance.findMany({
        where: {
          institutionId,
          sectionId,
          date: { gte: startDate, lte: endDate },
          periodNumber: null,
        },
        select: {
          studentId: true,
          status: true,
        },
      })

      const map = new Map<string, Record<string, number>>()
      for (const r of records) {
        const counts = map.get(r.studentId) ?? {
          PRESENT: 0, ABSENT: 0, LATE: 0,
          HALF_DAY: 0, EXCUSED: 0, total: 0,
        }
        counts[r.status] = (counts[r.status] ?? 0) + 1
        counts.total = (counts.total ?? 0) + 1
        map.set(r.studentId, counts)
      }

      const students = await prisma.studentSection.findMany({
        where: { institutionId, sectionId, status: 'ACTIVE' },
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

      const summary = students.map((ss) => {
        const c = map.get(ss.studentId) ?? {
          PRESENT: 0, ABSENT: 0, LATE: 0,
          HALF_DAY: 0, EXCUSED: 0, total: 0,
        }
        const present = (c.PRESENT ?? 0) + (c.LATE ?? 0)
        const pct = c.total > 0
          ? Math.round((present / c.total) * 10000) / 100
          : 0
        return {
          studentId: ss.studentId,
          firstName: ss.student.firstName,
          lastName: ss.student.lastName,
          rollNo: ss.student.rollNo,
          ...c,
          percentage: pct,
        }
      })

      return NextResponse.json({ month, year, summary })
    }

    // studentId heatmap
    const records = await prisma.attendance.findMany({
      where: {
        institutionId,
        studentId: studentId!,
        date: { gte: startDate, lte: endDate },
        periodNumber: null,
      },
      select: { date: true, status: true },
      orderBy: { date: 'asc' },
    })

    const days = records.map((r) => ({
      date: r.date.toISOString().slice(0, 10),
      status: r.status,
    }))

    return NextResponse.json({ month, year, days })
  } catch (err) {
    console.error('GET attendance summary error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
