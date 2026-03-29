import { NextResponse } from 'next/server'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'

export async function POST(
  req: Request,
  { params }: { params: { id: string } },
) {
  const ctx = await getSchoolContext(req, ['ADMIN'])
    if (isApiError(ctx)) return ctx
    const { institutionId } = ctx

  const { admissionId } = await req.json()
  if (!admissionId) {
    return NextResponse.json({ error: 'admissionId required' }, { status: 400 })
  }

  const inquiry = await prisma.inquiry.findFirst({
    where: {
      id: params.id,
      institutionId: institutionId,
    },
  })

  if (!inquiry) {
    return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 })
  }

  await prisma.inquiry.update({
    where: { id: params.id },
    data: { convertedToAdmissionId: admissionId },
  })

  return NextResponse.json({ ok: true })
}
