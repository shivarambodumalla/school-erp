import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/server/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: { institutionId: string } }
) {
  const session = await auth()
  if (!session || session.user.portalType !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  try {
    const [institution, payments] = await Promise.all([
      prisma.institution.findUnique({
        where: { id: params.institutionId },
        select: { planTier: true, customPricing: true },
      }),
      prisma.feePayment.findMany({
        where: { institutionId: params.institutionId },
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
