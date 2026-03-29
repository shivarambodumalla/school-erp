import { NextRequest, NextResponse } from 'next/server'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'

type Ctx = { params: Promise<{ staffId: string }> }

export async function GET(req: NextRequest,routeCtx: Ctx) {
  const ctx = await getSchoolContext(req, ['ADMIN'])
    if (isApiError(ctx)) return ctx
    const { institutionId } = ctx
  const { staffId } = await routeCtx.params

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

export async function POST(req: NextRequest,routeCtx: Ctx) {
  const ctx = await getSchoolContext(req, ['ADMIN'])
    if (isApiError(ctx)) return ctx
    const { institutionId } = ctx
  const { staffId } = await routeCtx.params

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
      uploadedById: ctx.userId,
    },
  })

  return NextResponse.json(doc, { status: 201 })
}
