import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/server/auth'
import { prisma } from '@/lib/prisma'

type Ctx = { params: Promise<{ staffId: string }> }

export async function GET(_req: NextRequest, ctx: Ctx) {
  const session = await auth()
  if (!session || session.user.portalType !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const institutionId = session.user.institutionId
  const { staffId } = await ctx.params

  const staff = await prisma.staff.findFirst({
    where: { id: staffId, institutionId },
    select: { id: true },
  })
  if (!staff) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const [documents, settings] = await Promise.all([
    prisma.staffDocument.findMany({
      where: { staffId, institutionId },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.staffSettings.findUnique({
      where: { institutionId },
      select: { documentTypes: true },
    }),
  ])

  return NextResponse.json({
    documents,
    documentTypes: settings?.documentTypes ?? [],
  })
}

export async function POST(req: NextRequest, ctx: Ctx) {
  const session = await auth()
  if (!session || session.user.portalType !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const institutionId = session.user.institutionId
  const { staffId } = await ctx.params

  const staff = await prisma.staff.findFirst({
    where: { id: staffId, institutionId },
    select: { id: true },
  })
  if (!staff) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const body = (await req.json()) as {
    documentType: string
    fileUrl: string
    fileName: string
    fileSize?: number
    mimeType?: string
    notes?: string
  }

  const doc = await prisma.staffDocument.create({
    data: {
      institutionId,
      staffId,
      documentType: body.documentType,
      fileUrl: body.fileUrl,
      fileName: body.fileName,
      fileSize: body.fileSize ?? null,
      mimeType: body.mimeType ?? null,
      notes: body.notes ?? null,
      uploadedById: session.user.id,
    },
  })

  return NextResponse.json(doc, { status: 201 })
}
