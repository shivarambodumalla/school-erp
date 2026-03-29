import { NextResponse } from 'next/server'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'
import { createInquirySchema } from '@/features/admissions/schemas/admissionSchema'

export async function GET(req: Request) {
  const ctx = await getSchoolContext(req, ['ADMIN', 'TEACHER'])
    if (isApiError(ctx)) return ctx
    const { institutionId } = ctx

  const inquiries = await prisma.inquiry.findMany({
    where: { institutionId: institutionId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      phone: true,
      email: true,
      source: true,
      notes: true,
      convertedToAdmissionId: true,
      createdAt: true,
    },
  })

  return NextResponse.json(inquiries)
}

export async function POST(req: Request) {
  const ctx = await getSchoolContext(req, ['ADMIN', 'TEACHER'])
    if (isApiError(ctx)) return ctx
    const { institutionId } = ctx

  const body = await req.json()
  const parsed = createInquirySchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid data' },
      { status: 400 },
    )
  }

  const d = parsed.data
  const inquiry = await prisma.inquiry.create({
    data: {
      institutionId: institutionId,
      name: d.name,
      phone: d.phone,
      email: d.email || null,
      source: d.source,
      notes: d.notes,
      createdById: ctx.userId,
    },
    select: { id: true, name: true, createdAt: true },
  })

  return NextResponse.json(inquiry, { status: 201 })
}
