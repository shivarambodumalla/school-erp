import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function POST(req: NextRequest, { params }: RouteContext) {
  const ctx = await getSchoolContext(req, ['ADMIN', 'TEACHER', 'STUDENT'])
  if (isApiError(ctx)) return ctx
  const { institutionId, userId } = ctx
  const { id } = await params

  // Verify circular exists and belongs to institution
  const circular = await prisma.schoolCircular.findFirst({
    where: { id, institutionId },
    select: { id: true },
  })

  if (!circular) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  // Upsert: idempotent — creates if not exists, no-ops if already read
  const read = await prisma.circularRead.upsert({
    where: {
      circularId_userId: { circularId: id, userId },
    },
    create: {
      circularId: id,
      userId,
    },
    update: {},
  })

  return NextResponse.json(read)
}
