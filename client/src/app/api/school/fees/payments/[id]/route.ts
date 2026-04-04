import { NextResponse } from 'next/server'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const ctx = await getSchoolContext(req, ['ADMIN'])
  if (isApiError(ctx)) return ctx
  const { id } = await params

  const payment = await prisma.feePayment.findUnique({
    where: { id },
    include: {
      student: { select: { firstName: true, lastName: true, admissionNo: true } },
      feeCategory: { select: { name: true, frequency: true } },
    },
  })
  if (!payment) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(payment)
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const ctx = await getSchoolContext(req, ['ADMIN'])
  if (isApiError(ctx)) return ctx
  const { id } = await params
  const body = (await req.json()) as { status: string; reason?: string }

  if (body.status === 'WAIVED') {
    const updated = await prisma.feePayment.update({
      where: { id },
      data: { status: 'WAIVED', notes: body.reason ?? null },
    })
    return NextResponse.json(updated)
  }

  return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  return NextResponse.json(
    {
      error:
        'Fee payment records cannot be permanently deleted. Use PATCH with action=REVERSE instead.',
    },
    { status: 405 }
  )
}