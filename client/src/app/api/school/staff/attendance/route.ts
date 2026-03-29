import { NextRequest, NextResponse } from 'next/server'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const ctx = await getSchoolContext(req, ['ADMIN'])
    if (isApiError(ctx)) return ctx
    const { institutionId } = ctx
  const sp = req.nextUrl.searchParams
  const dateStr = sp.get('date') ?? new Date().toISOString().slice(0, 10)
  const departmentId = sp.get('departmentId')

  try {
    const staff = await prisma.staff.findMany({
      where: {
        institutionId,
        status: 'ACTIVE',
        ...(departmentId ? { departmentId } : {}),
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        employeeNo: true,
        department: { select: { name: true } },
      },
      orderBy: { firstName: 'asc' },
    })

    const date = new Date(dateStr + 'T00:00:00.000Z')
    const records = await prisma.staffAttendance.findMany({
      where: { institutionId, date },
    })

    const recordMap = new Map(records.map((r) => [r.staffId, r]))

    const rows = staff.map((s) => {
      const rec = recordMap.get(s.id)
      return {
        staffId: s.id,
        name: `${s.firstName} ${s.lastName}`,
        employeeNo: s.employeeNo,
        dept: s.department?.name ?? null,
        status: rec?.status ?? null,
        checkInTime: rec?.checkInTime ?? null,
        checkOutTime: rec?.checkOutTime ?? null,
        attendanceId: rec?.id ?? null,
      }
    })

    return NextResponse.json({ date: dateStr, rows })
  } catch (err) {
    console.error('GET staff attendance error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}

interface AttendanceRecord {
  staffId: string
  status: 'PRESENT' | 'ABSENT' | 'HALF_DAY' | 'ON_LEAVE' | 'HOLIDAY' | 'LATE'
  checkInTime?: string
  checkOutTime?: string
  notes?: string
}

export async function POST(req: NextRequest) {
  const ctx = await getSchoolContext(req, ['ADMIN'])
    if (isApiError(ctx)) return ctx
    const { institutionId } = ctx

  try {
    const body = (await req.json()) as {
      date?: string
      records: AttendanceRecord[]
    }

    const dateStr = body.date ?? new Date().toISOString().slice(0, 10)
    const date = new Date(dateStr + 'T00:00:00.000Z')
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
      await prisma.staffAttendance.upsert({
        where: { staffId_date: { staffId: r.staffId, date } },
        update: {
          status: r.status,
          checkInTime: r.checkInTime ?? null,
          checkOutTime: r.checkOutTime ?? null,
          notes: r.notes ?? null,
          markedById: ctx.userId,
        },
        create: {
          institutionId,
          staffId: r.staffId,
          date,
          status: r.status,
          checkInTime: r.checkInTime ?? null,
          checkOutTime: r.checkOutTime ?? null,
          notes: r.notes ?? null,
          markedById: ctx.userId,
        },
      })
      savedCount++
    }

    return NextResponse.json({ saved: savedCount })
  } catch (err) {
    console.error('POST staff attendance error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
