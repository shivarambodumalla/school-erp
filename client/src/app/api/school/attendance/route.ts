import { NextRequest, NextResponse } from 'next/server'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'
import { sendNotifications } from '@/lib/notifications'

export async function GET(req: NextRequest) {
  const ctx = await getSchoolContext(req, ['ADMIN', 'TEACHER'])
  if (isApiError(ctx)) return ctx
  const { institutionId } = ctx

  const sp = req.nextUrl.searchParams
  const sectionId = sp.get('sectionId')
  const dateStr = sp.get('date') ?? new Date().toISOString().slice(0, 10)
  const subjectId = sp.get('subjectId')
  const periodNumber = sp.get('periodNumber')

  if (!sectionId) {
    return NextResponse.json(
      { error: 'sectionId is required' },
      { status: 400 },
    )
  }

  try {
    const settings = await prisma.attendanceSettings.findUnique({
      where: { institutionId },
    })

    const mode = settings?.mode ?? 'DAILY'
    const date = new Date(dateStr + 'T00:00:00.000Z')

    const studentSections = await prisma.studentSection.findMany({
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

    const records = await prisma.attendance.findMany({
      where: {
        institutionId,
        sectionId,
        date,
        ...(subjectId ? { subjectId } : {}),
        ...(periodNumber
          ? { periodNumber: Number(periodNumber) }
          : {}),
      },
    })

    const recordMap = new Map(
      records.map((r) => [r.studentId, r]),
    )

    const students = studentSections.map((ss) => {
      const rec = recordMap.get(ss.studentId)
      return {
        studentId: ss.studentId,
        firstName: ss.student.firstName,
        lastName: ss.student.lastName,
        rollNo: ss.student.rollNo,
        status: rec?.status ?? null,
        notes: rec?.notes ?? null,
      }
    })

    return NextResponse.json({
      mode,
      date: dateStr,
      alreadyMarked: records.length > 0,
      students,
    })
  } catch (err) {
    console.error('GET attendance error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}

interface AttendanceRecord {
  studentId: string
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY' | 'EXCUSED'
  notes?: string
}

export async function POST(req: NextRequest) {
  const ctx = await getSchoolContext(req, ['ADMIN', 'TEACHER'])
  if (isApiError(ctx)) return ctx
  const { institutionId } = ctx


  try {
    const body = await req.json() as {
      sectionId: string
      date: string
      subjectId?: string
      periodNumber?: number
      records: AttendanceRecord[]
    }

    const date = new Date(body.date + 'T00:00:00.000Z')
    const today = new Date()
    today.setHours(23, 59, 59, 999)

    if (date > today) {
      return NextResponse.json(
        { error: 'Cannot mark attendance for future dates' },
        { status: 400 },
      )
    }

    let savedCount = 0
    for (const r of body.records) {
      const existing = await prisma.attendance.findFirst({
        where: {
          studentId: r.studentId,
          sectionId: body.sectionId,
          date,
          periodNumber: body.periodNumber ?? null,
          institutionId,
        },
      })

      if (existing) {
        await prisma.attendance.update({
          where: { id: existing.id },
          data: {
            status: r.status,
            notes: r.notes ?? null,
            markedById: ctx.userId,
          },
        })
      } else {
        await prisma.attendance.create({
          data: {
            institutionId,
            studentId: r.studentId,
            sectionId: body.sectionId,
            date,
            subjectId: body.subjectId ?? null,
            periodNumber: body.periodNumber ?? null,
            status: r.status,
            notes: r.notes ?? null,
            markedById: ctx.userId,
          },
        })
      }
      savedCount++
    }

    const saved = { length: savedCount }

    await prisma.auditLog.create({
      data: {
        institutionId,
        userId: ctx.userId,
        action: 'ATTENDANCE_MARK',
        tableName: 'Attendance',
        recordId: body.sectionId,
        after: {
          date: body.date,
          count: saved.length,
        },
      },
    })

    // Notify parents of absent students
    try {
      const absentStudentIds = body.records.filter(r => r.status === 'ABSENT').map(r => r.studentId)
      if (absentStudentIds.length > 0) {
        const guardians = await prisma.guardian.findMany({
          where: { studentId: { in: absentStudentIds }, userId: { not: null } },
          select: { userId: true }
        })
        const parentUserIds = guardians.map(g => g.userId).filter(Boolean) as string[]
        if (parentUserIds.length > 0) {
          await sendNotifications({
            institutionId,
            userIds: parentUserIds,
            type: 'ATTENDANCE_ABSENT',
            title: 'Attendance alert',
            body: `Your child was marked absent today.`,
            priority: 'HIGH',
          })
        }
      }
    } catch (notifErr) {
      console.error('[Notifications] attendance error:', notifErr)
    }

    return NextResponse.json({ saved: saved.length, date: body.date })
  } catch (err) {
    console.error('POST attendance error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
