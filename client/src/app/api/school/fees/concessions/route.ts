import { NextResponse } from 'next/server'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  const ctx = await getSchoolContext(req, ['ADMIN'])
  if (isApiError(ctx)) return ctx
  const { institutionId } = ctx
  const url = new URL(req.url)
  const studentId = url.searchParams.get('studentId')

  const where: Record<string, unknown> = { institutionId }
  if (studentId) where.studentId = studentId

  const concessions = await prisma.feeConcession.findMany({
    where,
    include: { student: { select: { firstName: true, lastName: true, admissionNo: true } } },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(concessions)
}

export async function POST(req: Request) {
  const ctx = await getSchoolContext(req, ['ADMIN'])
  if (isApiError(ctx)) return ctx
  const { institutionId, userId } = ctx

  const body = (await req.json()) as {
    studentId: string; feeCategoryId?: string; name: string
    type: string; amount: number; validFrom: string
    validTill?: string; notes?: string
  }

  const concession = await prisma.feeConcession.create({
    data: {
      institutionId,
      studentId: body.studentId,
      feeCategoryId: body.feeCategoryId ?? null,
      name: body.name,
      type: body.type as 'FIXED' | 'PERCENTAGE',
      amount: body.amount,
      validFrom: new Date(body.validFrom),
      validTill: body.validTill ? new Date(body.validTill) : null,
      approvedById: userId,
      notes: body.notes ?? null,
    },
    include: { student: { select: { firstName: true, lastName: true } } },
  })
  return NextResponse.json(concession, { status: 201 })
}