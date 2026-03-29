import { NextResponse } from 'next/server'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  const ctx = await getSchoolContext(req, [
    'ADMIN', 'TEACHER', 'STUDENT', 'PARENT',
  ])
  if (isApiError(ctx)) return ctx

  const count = await prisma.notification.count({
    where: {
      institutionId: ctx.institutionId,
      userId: ctx.userId,
      status: 'SENT',
    },
  })

  return NextResponse.json(
    { count },
    { headers: { 'Cache-Control': 'max-age=30' } }
  )
}
