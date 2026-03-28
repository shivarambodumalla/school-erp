import { NextResponse } from 'next/server'
import { auth } from '@/server/auth'
import { prisma } from '@/lib/prisma'
import { updateGuardianSchema } from '@/features/admissions/schemas/admissionSchema'

interface Ctx { params: { id: string; gId: string } }

export async function PATCH(req: Request, { params }: Ctx) {
  const session = await auth()
  if (!session || session.user.portalType !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const admission = await prisma.admission.findFirst({
    where: { id: params.id, institutionId: session.user.institutionId },
    select: { id: true },
  })

  if (!admission) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const body = await req.json()
  const parsed = updateGuardianSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid data' },
      { status: 400 },
    )
  }

  const d = parsed.data
  const updated = await prisma.guardian.update({
    where: { id: params.gId },
    data: {
      ...d,
      email: d.email || null,
    },
  })

  return NextResponse.json(updated)
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const session = await auth()
  if (!session || session.user.portalType !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const admission = await prisma.admission.findFirst({
    where: { id: params.id, institutionId: session.user.institutionId },
    select: { id: true },
  })

  if (!admission) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  await prisma.guardian.delete({ where: { id: params.gId } })

  return NextResponse.json({ success: true })
}
