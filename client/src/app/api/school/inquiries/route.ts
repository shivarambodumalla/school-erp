import { NextResponse } from 'next/server'
import { auth } from '@/server/auth'
import { prisma } from '@/lib/prisma'
import { createInquirySchema } from '@/features/admissions/schemas/admissionSchema'

export async function GET() {
  const session = await auth()
  if (!session || !['ADMIN', 'TEACHER'].includes(session.user.portalType)) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const inquiries = await prisma.inquiry.findMany({
    where: { institutionId: session.user.institutionId },
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
  const session = await auth()
  if (!session || session.user.portalType !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

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
      institutionId: session.user.institutionId,
      name: d.name,
      phone: d.phone,
      email: d.email || null,
      source: d.source,
      notes: d.notes,
      createdById: session.user.id,
    },
    select: { id: true, name: true, createdAt: true },
  })

  return NextResponse.json(inquiry, { status: 201 })
}
