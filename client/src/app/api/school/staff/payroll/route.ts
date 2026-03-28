import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/server/auth'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session || session.user.portalType !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const institutionId = session.user.institutionId
  const sp = req.nextUrl.searchParams
  const month = Number(sp.get('month') ?? new Date().getMonth() + 1)
  const year = Number(sp.get('year') ?? new Date().getFullYear())

  try {
    const salaries = await prisma.staffSalary.findMany({
      where: { institutionId, month, year },
      include: {
        staff: {
          select: {
            id: true, firstName: true, lastName: true,
            employeeNo: true, designation: true,
            department: { select: { name: true } },
          },
        },
      },
      orderBy: { staff: { firstName: 'asc' } },
    })

    const processedIds = new Set(salaries.map((s) => s.staffId))

    const allStaff = await prisma.staff.findMany({
      where: { institutionId, status: 'ACTIVE' },
      select: {
        id: true, firstName: true, lastName: true,
        employeeNo: true, designation: true,
        department: { select: { name: true } },
      },
      orderBy: { firstName: 'asc' },
    })

    const unprocessed = allStaff
      .filter((s) => !processedIds.has(s.id))
      .map((s) => ({
        staffId: s.id,
        name: `${s.firstName} ${s.lastName}`,
        employeeNo: s.employeeNo,
        designation: s.designation,
        dept: s.department?.name ?? null,
      }))

    const processed = salaries.map((s) => ({
      id: s.id,
      staffId: s.staffId,
      name: `${s.staff.firstName} ${s.staff.lastName}`,
      employeeNo: s.staff.employeeNo,
      designation: s.staff.designation,
      dept: s.staff.department?.name ?? null,
      basicSalary: s.basicSalary.toString(),
      allowances: s.allowances,
      deductions: s.deductions,
      lopDays: s.lopDays,
      lopDeduction: s.lopDeduction.toString(),
      grossSalary: s.grossSalary.toString(),
      netSalary: s.netSalary.toString(),
      paidAt: s.paidAt?.toISOString() ?? null,
      payslipUrl: s.payslipUrl,
      notes: s.notes,
    }))

    return NextResponse.json({ month, year, processed, unprocessed })
  } catch (err) {
    console.error('GET staff payroll error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}

interface AllowanceDeduction {
  label: string
  amount: number
}

interface PayrollEntry {
  staffId: string
  basicSalary: number
  allowances: AllowanceDeduction[]
  deductions: AllowanceDeduction[]
  lopDays: number
  notes?: string
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session || session.user.portalType !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const institutionId = session.user.institutionId

  try {
    const body = (await req.json()) as {
      month: number
      year: number
      entries: PayrollEntry[]
    }

    let totalPayout = new Prisma.Decimal(0)
    let processedCount = 0

    for (const e of body.entries) {
      const basic = new Prisma.Decimal(e.basicSalary)
      const allowanceTotal = e.allowances.reduce(
        (sum, a) => sum.add(new Prisma.Decimal(a.amount)),
        new Prisma.Decimal(0),
      )
      const deductionTotal = e.deductions.reduce(
        (sum, d) => sum.add(new Prisma.Decimal(d.amount)),
        new Prisma.Decimal(0),
      )
      const lopDeduction = basic.div(30).mul(e.lopDays)
      const grossSalary = basic.add(allowanceTotal)
      const netSalary = grossSalary.sub(deductionTotal).sub(lopDeduction)

      await prisma.staffSalary.upsert({
        where: {
          staffId_month_year: {
            staffId: e.staffId,
            month: body.month,
            year: body.year,
          },
        },
        update: {
          basicSalary: basic,
          allowances: e.allowances as unknown as Prisma.JsonArray,
          deductions: e.deductions as unknown as Prisma.JsonArray,
          lopDays: e.lopDays,
          lopDeduction,
          grossSalary,
          netSalary,
          notes: e.notes ?? null,
          processedById: session.user.id,
        },
        create: {
          institutionId,
          staffId: e.staffId,
          month: body.month,
          year: body.year,
          basicSalary: basic,
          allowances: e.allowances as unknown as Prisma.JsonArray,
          deductions: e.deductions as unknown as Prisma.JsonArray,
          lopDays: e.lopDays,
          lopDeduction,
          grossSalary,
          netSalary,
          notes: e.notes ?? null,
          processedById: session.user.id,
        },
      })

      totalPayout = totalPayout.add(netSalary)
      processedCount++
    }

    return NextResponse.json({
      processed: processedCount,
      totalPayout: totalPayout.toString(),
    })
  } catch (err) {
    console.error('POST staff payroll error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
