import { NextResponse } from 'next/server'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  const ctx = await getSchoolContext(req, ['ADMIN'])
    if (isApiError(ctx)) return ctx
    const { institutionId } = ctx

  const config = await prisma.staffSalaryConfig.upsert({
    where: { institutionId },
    create: { institutionId },
    update: {},
  })

  return NextResponse.json(config)
}

export async function PATCH(req: Request) {
  const ctx = await getSchoolContext(req, ['ADMIN'])
    if (isApiError(ctx)) return ctx
    const { institutionId } = ctx
  const body = (await req.json()) as {
    allowanceTypes?: string[]
    deductionTypes?: string[]
  }

  const data: Record<string, unknown> = {}
  if (body.allowanceTypes !== undefined) {
    data.allowanceTypes = body.allowanceTypes
  }
  if (body.deductionTypes !== undefined) {
    data.deductionTypes = body.deductionTypes
  }

  const updated = await prisma.staffSalaryConfig.update({
    where: { institutionId },
    data,
  })

  return NextResponse.json(updated)
}
