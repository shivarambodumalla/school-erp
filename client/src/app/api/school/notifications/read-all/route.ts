import { NextResponse } from 'next/server'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const ctx = await getSchoolContext(req, [
    'ADMIN', 'TEACHER', 'STUDENT', 'PARENT',
  ])
  if (isApiError(ctx)) return ctx

  const result = await prisma.notification.updateMany({
    where: {
      userId: ctx.userId,
      institutionId: ctx.institutionId,
      status: 'SENT',
    },
    data: { status: 'READ', readAt: new Date() },
  })

  return NextResponse.json({ updated: result.count })
}
