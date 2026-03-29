import { NextResponse } from 'next/server'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  const ctx = await getSchoolContext(req, ['ADMIN'])
    if (isApiError(ctx)) return ctx
    const { institutionId } = ctx

  try {
    const [institution, payments] = await Promise.all([
      prisma.institution.findUnique({
        where: { id: institutionId },
        select: { planTier: true, customPricing: true },
      }),
      prisma.feePayment.findMany({
        where: { institutionId },
        select: { id: true, amount: true, status: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
    ])

    const totalRevenue = payments
      .filter(p => p.status === 'PAID')
      .reduce((sum, p) => sum + Number(p.amount), 0)

    const outstandingAmount = payments
      .filter(p => p.status === 'PENDING')
      .reduce((sum, p) => sum + Number(p.amount), 0)

    const lastPayment = payments.find(p => p.status === 'PAID')

    return NextResponse.json({
      planTier: institution?.planTier ?? 'STARTER',
      customPricing: institution?.customPricing
        ? Number(institution.customPricing) : null,
      totalRevenue,
      outstandingAmount,
      lastPaymentDate: lastPayment?.createdAt.toISOString() ?? null,
      payments: payments.map(p => ({
        id: p.id,
        amount: Number(p.amount),
        status: p.status,
        createdAt: p.createdAt.toISOString(),
      })),
    })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
