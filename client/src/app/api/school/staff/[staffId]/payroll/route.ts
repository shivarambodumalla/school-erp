import { NextResponse } from 'next/server'
import { auth } from '@/server/auth'
import { prisma } from '@/lib/prisma'

interface RouteContext {
  params: Promise<{ staffId: string }>
}

export async function GET(_req: Request, ctx: RouteContext) {
  const session = await auth()
  if (!session || !['ADMIN', 'TEACHER'].includes(session.user.portalType)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const institutionId = session.user.institutionId
  const { staffId } = await ctx.params

  try {
    const salaries = await prisma.staffSalary.findMany({
      where: { institutionId, staffId },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    })

    const rows = salaries.map((s) => ({
      id: s.id,
      month: s.month,
      year: s.year,
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

    return NextResponse.json({ salaries: rows })
  } catch (err) {
    console.error('GET staff/:id/payroll error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
