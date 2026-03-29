import { NextResponse } from 'next/server'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  const ctx = await getSchoolContext(req, ['ADMIN'])
    if (isApiError(ctx)) return ctx
    const { institutionId } = ctx

  const settings = await prisma.staffSettings.upsert({
    where: { institutionId },
    create: { institutionId },
    update: {},
  })

  return NextResponse.json(settings)
}

export async function PATCH(req: Request) {
  const ctx = await getSchoolContext(req, ['ADMIN'])
    if (isApiError(ctx)) return ctx
    const { institutionId } = ctx
  const body = (await req.json()) as {
    employeeNoPrefix?: string
    employeeNoCurrentSeq?: number
    documentTypes?: string[]
  }

  const data: Record<string, unknown> = {}
  if (body.employeeNoPrefix !== undefined) {
    data.employeeNoPrefix = body.employeeNoPrefix
  }
  if (body.employeeNoCurrentSeq !== undefined) {
    data.employeeNoCurrentSeq = body.employeeNoCurrentSeq
  }
  if (body.documentTypes !== undefined) {
    data.documentTypes = body.documentTypes
  }

  const updated = await prisma.staffSettings.update({
    where: { institutionId },
    data,
  })

  return NextResponse.json(updated)
}
