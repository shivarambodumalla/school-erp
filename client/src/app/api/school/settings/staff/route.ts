import { NextResponse } from 'next/server'
import { auth } from '@/server/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session || session.user.portalType !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const institutionId = session.user.institutionId

  const settings = await prisma.staffSettings.upsert({
    where: { institutionId },
    create: { institutionId },
    update: {},
  })

  return NextResponse.json(settings)
}

export async function PATCH(req: Request) {
  const session = await auth()
  if (!session || session.user.portalType !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const institutionId = session.user.institutionId
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
