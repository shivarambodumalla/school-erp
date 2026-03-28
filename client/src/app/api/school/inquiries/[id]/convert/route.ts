import { NextResponse } from 'next/server'
import { auth } from '@/server/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  req: Request,
  { params }: { params: { id: string } },
) {
  const session = await auth()
  if (!session || session.user.portalType !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const { admissionId } = await req.json()
  if (!admissionId) {
    return NextResponse.json({ error: 'admissionId required' }, { status: 400 })
  }

  const inquiry = await prisma.inquiry.findFirst({
    where: {
      id: params.id,
      institutionId: session.user.institutionId,
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
