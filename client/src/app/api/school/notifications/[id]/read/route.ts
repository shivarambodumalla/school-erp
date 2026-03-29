import { NextResponse } from 'next/server'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'

export async function POST(
  req: Request,
  routeCtx: { params: Promise<{ id: string }> }
) {
  const ctx = await getSchoolContext(req, [
    'ADMIN', 'TEACHER', 'STUDENT', 'PARENT',
  ])
  if (isApiError(ctx)) return ctx
  const { id } = await routeCtx.params

  const notif = await prisma.notification.findFirst({
    where: { id, userId: ctx.userId, institutionId: ctx.institutionId },
  })

  if (!notif) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  await prisma.notification.update({
    where: { id },
    data: { status: 'READ', readAt: new Date() },
  })

  return NextResponse.json({ ok: true })
}
