import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'

export async function GET(req: NextRequest) {
  const ctx = await getSchoolContext(req, ['ADMIN'])
  if (isApiError(ctx)) return ctx
  const { institutionId } = ctx

  // Upsert: return existing or create with defaults
  const settings = await prisma.enquiryFormSettings.upsert({
    where: { institutionId },
    create: {
      institutionId,
      isEnabled: true,
      requireDOB: false,
      requirePrevSchool: false,
    },
    update: {},
  })

  return NextResponse.json(settings)
}

export async function PATCH(req: NextRequest) {
  const ctx = await getSchoolContext(req, ['ADMIN'])
  if (isApiError(ctx)) return ctx
  const { institutionId } = ctx

  const body = (await req.json()) as Record<string, unknown>

  const allowedFields = [
    'isEnabled', 'welcomeMessage', 'thankYouMessage',
    'requireDOB', 'requirePrevSchool', 'whatsappTemplate', 'emailTemplate',
  ] as const

  const data: Record<string, unknown> = {}
  for (const key of allowedFields) {
    if (key in body) {
      data[key] = body[key]
    }
  }

  // Upsert to handle case where settings don't exist yet
  const settings = await prisma.enquiryFormSettings.upsert({
    where: { institutionId },
    create: {
      institutionId,
      isEnabled: true,
      requireDOB: false,
      requirePrevSchool: false,
      ...data,
    },
    update: data,
  })

  return NextResponse.json(settings)
}
