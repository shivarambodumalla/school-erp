import { NextResponse } from 'next/server'
import { auth } from '@/server/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session || session.user.portalType !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const institutionId = session.user.institutionId

  const config = await prisma.staffSalaryConfig.upsert({
    where: { institutionId },
    create: { institutionId },
    update: {},
  })

  return NextResponse.json(config)
}

export async function PATCH(req: Request) {
  const session = await auth()
  if (!session || session.user.portalType !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const institutionId = session.user.institutionId
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
