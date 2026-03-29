import { NextResponse } from 'next/server'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'
import { updateGuardianSchema } from '@/features/admissions/schemas/admissionSchema'

interface Ctx { params: { id: string; gId: string } }

export async function PATCH(req: Request, { params }: Ctx) {
  const ctx = await getSchoolContext(req, ['ADMIN'])
    if (isApiError(ctx)) return ctx
    const { institutionId } = ctx

  const admission = await prisma.admission.findFirst({
    where: { id: params.id, institutionId: institutionId },
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

export async function DELETE(req: Request, { params }: Ctx) {
  const ctx = await getSchoolContext(req, ['ADMIN'])
    if (isApiError(ctx)) return ctx
    const { institutionId } = ctx

  const admission = await prisma.admission.findFirst({
    where: { id: params.id, institutionId: institutionId },
    select: { id: true },
  })

  if (!admission) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  await prisma.guardian.delete({ where: { id: params.gId } })

  return NextResponse.json({ success: true })
}
