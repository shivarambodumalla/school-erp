import { NextResponse } from 'next/server'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  const ctx = await getSchoolContext(req, [
    'ADMIN', 'TEACHER', 'STUDENT', 'PARENT',
  ])
  if (isApiError(ctx)) return ctx

  const pref = await prisma.notificationPreference.upsert({
    where: { userId: ctx.userId },
    create: {
      userId: ctx.userId,
      institutionId: ctx.institutionId,
    },
    update: {},
  })

  return NextResponse.json(pref)
}

export async function PATCH(req: Request) {
  const ctx = await getSchoolContext(req, [
    'ADMIN', 'TEACHER', 'STUDENT', 'PARENT',
  ])
  if (isApiError(ctx)) return ctx

  const body = await req.json() as Record<string, unknown>

  const allowed = [
    'pushEnabled', 'emailEnabled', 'smsEnabled',
    'whatsappEnabled', 'mutedTypes',
    'quietHoursStart', 'quietHoursEnd',
  ]

  const data: Record<string, unknown> = {}
  for (const key of allowed) {
    if (key in body) data[key] = body[key]
  }

  const pref = await prisma.notificationPreference.upsert({
    where: { userId: ctx.userId },
    create: {
      userId: ctx.userId,
      institutionId: ctx.institutionId,
      ...data,
    },
    update: data,
  })

  return NextResponse.json(pref)
}
