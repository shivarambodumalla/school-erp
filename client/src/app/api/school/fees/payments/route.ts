import { NextResponse } from 'next/server'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'
import { sendNotifications } from '@/lib/notifications'

const PAGE_SIZE = 30

export async function GET(req: Request) {
  const ctx = await getSchoolContext(req, ['ADMIN'])
  if (isApiError(ctx)) return ctx
  const { institutionId } = ctx
  const url = new URL(req.url)

  const where: Record<string, unknown> = { institutionId }
  const studentId = url.searchParams.get('studentId')
  const status = url.searchParams.get('status')
  const month = url.searchParams.get('month')
  const year = url.searchParams.get('year')
  const categoryId = url.searchParams.get('categoryId')
  const page = Math.max(1, Number(url.searchParams.get('page') ?? '1'))

  if (studentId) where.studentId = studentId
  if (status) where.status = status
  if (month) where.month = Number(month)
  if (year) where.year = Number(year)
  if (categoryId) where.feeCategoryId = categoryId

  const [payments, total] = await Promise.all([
    prisma.feePayment.findMany({
      where,
      include: {
        student: { select: { firstName: true, lastName: true, admissionNo: true } },
        feeCategory: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.feePayment.count({ where }),
  ])

  return NextResponse.json({ payments, total, page })
}

export async function POST(req: Request) {
  const ctx = await getSchoolContext(req, ['ADMIN'])
  if (isApiError(ctx)) return ctx
  const { institutionId, userId } = ctx

  const body = (await req.json()) as {
    paymentId?: string; studentId: string; feeCategoryId: string
    amount: number; method: string; month?: number; year?: number
    transactionRef?: string; notes?: string
  }

  // Find or create payment
  const payment = body.paymentId
    ? await prisma.feePayment.findUnique({ where: { id: body.paymentId } })
    : await prisma.feePayment.findFirst({
        where: {
          studentId: body.studentId,
          feeCategoryId: body.feeCategoryId,
          month: body.month ?? null,
          year: body.year ?? null,
          institutionId,
        },
      })

  // Calculate fine
  let fineAmount = 0
  const settings = await prisma.feeSettings.findUnique({ where: { institutionId } })
  if (settings?.lateFineEnabled && payment?.dueDate) {
    const daysOverdue = Math.floor(
      (Date.now() - new Date(payment.dueDate).getTime()) / 86400000
    )
    if (daysOverdue > 0) {
      const fine = await prisma.feeFine.findFirst({
        where: { institutionId, isActive: true, OR: [
          { feeCategoryId: body.feeCategoryId }, { feeCategoryId: null }
        ] },
      })
      if (fine) {
        const grace = fine.graceDays
        if (daysOverdue > grace) {
          const overDays = daysOverdue - grace
          if (fine.type === 'FIXED') fineAmount = Number(fine.amount)
          else if (fine.type === 'PER_DAY') {
            fineAmount = Number(fine.amount) * overDays
            if (fine.maxAmount) fineAmount = Math.min(fineAmount, Number(fine.maxAmount))
          } else if (fine.type === 'PERCENTAGE') {
            fineAmount = (Number(fine.amount) / 100) * body.amount
          }
        }
      }
    }
  }

  // Apply concession
  let concessionDeduction = 0
  const concession = await prisma.feeConcession.findFirst({
    where: {
      studentId: body.studentId,
      institutionId,
      validFrom: { lte: new Date() },
      OR: [{ validTill: null }, { validTill: { gte: new Date() } }],
      ...(body.feeCategoryId ? { OR: [{ feeCategoryId: body.feeCategoryId }, { feeCategoryId: null }] } : {}),
    },
  })
  if (concession) {
    if (concession.type === 'FIXED') concessionDeduction = Number(concession.amount)
    else concessionDeduction = (Number(concession.amount) / 100) * body.amount
  }

  const totalAmount = Math.max(0, body.amount + fineAmount - concessionDeduction)

  // Generate receipt number
  const feeSettings = await prisma.feeSettings.update({
    where: { institutionId },
    data: { receiptCurrentSeq: { increment: 1 } },
  })
  const seq = feeSettings.receiptCurrentSeq
  const yr = new Date().getFullYear()
  const receiptNo = `${feeSettings.receiptPrefix}-${yr}-${String(seq).padStart(4, '0')}`

  const data = {
    status: 'PAID' as const,
    method: body.method as 'CASH',
    amount: body.amount,
    fineAmount,
    totalAmount,
    paidAt: new Date(),
    receiptNo,
    transactionRef: body.transactionRef ?? null,
    notes: body.notes ?? null,
    collectedById: userId,
  }

  let result
  if (payment) {
    result = await prisma.feePayment.update({ where: { id: payment.id }, data })
  } else {
    result = await prisma.feePayment.create({
      data: {
        ...data,
        institutionId,
        studentId: body.studentId,
        feeCategoryId: body.feeCategoryId,
        dueDate: new Date(),
        month: body.month ?? null,
        year: body.year ?? null,
      },
    })
  }

  // Notify student about successful payment
  try {
    const student = await prisma.student.findUnique({
      where: { id: body.studentId },
      select: { userId: true },
    })
    if (student?.userId) {
      await sendNotifications({
        institutionId,
        userIds: [student.userId],
        type: 'FEE_PAID',
        title: 'Payment received',
        body: `Your fee payment of ${totalAmount} has been recorded. Receipt: ${receiptNo}`,
      })
    }
  } catch (notifErr) {
    console.error('[Notifications] fee payment error:', notifErr)
  }

  return NextResponse.json({
    paymentId: result.id, receiptNo, totalAmount, fineAmount,
  })
}