import { NextResponse } from 'next/server'
import { auth } from '@/server/auth'
import { prisma } from '@/lib/prisma'
import { createGuardianSchema } from '@/features/admissions/schemas/admissionSchema'

interface Ctx { params: { id: string } }

export async function GET(_req: Request, { params }: Ctx) {
  const session = await auth()
  if (!session || !['ADMIN', 'TEACHER'].includes(session.user.portalType)) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const admission = await prisma.admission.findFirst({
    where: { id: params.id, institutionId: session.user.institutionId },
    select: { id: true },
  })

  if (!admission) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const guardians = await prisma.guardian.findMany({
    where: { admissionId: params.id },
    orderBy: { type: 'asc' },
  })

  return NextResponse.json(guardians)
}

export async function POST(req: Request, { params }: Ctx) {
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
  const parsed = createGuardianSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid data' },
      { status: 400 },
    )
  }

  const d = parsed.data

  // Enforce max 1 FATHER, max 1 MOTHER
  if (d.type === 'FATHER' || d.type === 'MOTHER') {
    const existing = await prisma.guardian.findFirst({
      where: { admissionId: params.id, type: d.type },
      select: { id: true },
    })
    if (existing) {
      return NextResponse.json(
        { error: `A ${d.type.toLowerCase()} is already added` },
        { status: 409 },
      )
    }
  }

  const guardian = await prisma.guardian.create({
    data: {
      admissionId: params.id,
      type: d.type,
      name: d.name,
      phone: d.phone,
      email: d.email || null,
      relationship: d.relationship,
      isPrimaryContact: d.isPrimaryContact,
      isEmergencyContact: d.isEmergencyContact,
      canLogin: d.canLogin,
    },
  })

  return NextResponse.json(guardian, { status: 201 })
}
