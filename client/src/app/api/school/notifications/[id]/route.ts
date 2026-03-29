import { NextResponse } from 'next/server'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  req: Request,
  routeCtx: { params: Promise<{ id: string }> }
) {
  const ctx = await getSchoolContext(req, ['ADMIN'])
  if (isApiError(ctx)) return ctx
  const { id } = await routeCtx.params

  await prisma.notification.deleteMany({
    where: { id, institutionId: ctx.institutionId },
  })

  return NextResponse.json({ ok: true })
}
