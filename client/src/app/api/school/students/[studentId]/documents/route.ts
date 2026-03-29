import { NextResponse } from 'next/server'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: Request,
  { params }: { params: { studentId: string } },
) {
  const ctx = await getSchoolContext(req, ['ADMIN', 'TEACHER'])
    if (isApiError(ctx)) return ctx
    const { institutionId } = ctx

  const student = await prisma.student.findUnique({
    where: { id: params.studentId },
    select: { id: true, institutionId: true },
  })
  if (!student || student.institutionId !== institutionId) {
    return NextResponse.json({ error: 'Student not found' }, { status: 404 })
  }

  const [docTypes, uploadedDocs] = await Promise.all([
    prisma.documentTypeConfig.findMany({
      where: { institutionId, showInProfile: true },
      orderBy: { order: 'asc' },
      select: {
        id: true, name: true, isRequired: true,
        acceptedFormats: true, order: true,
      },
    }),
    prisma.studentDocument.findMany({
      where: { studentId: student.id, institutionId },
      select: {
        id: true, documentTypeConfigId: true, documentTypeName: true,
        fileUrl: true, fileName: true, fileSize: true, mimeType: true,
        isVerified: true, verifiedAt: true, notes: true, createdAt: true,
      },
    }),
  ])

  // Merge: each config + its uploaded doc (if any)
  const merged = docTypes.map(dt => ({
    ...dt,
    uploadedDoc: uploadedDocs.find(d => d.documentTypeConfigId === dt.id) ?? null,
  }))

  // Include docs not linked to any config (uploaded manually)
  const configIds = new Set(docTypes.map(dt => dt.id))
  const unlinked = uploadedDocs
    .filter(d => !d.documentTypeConfigId || !configIds.has(d.documentTypeConfigId))
    .map(d => ({
      id: d.documentTypeConfigId ?? d.id,
      name: d.documentTypeName,
      isRequired: false,
      acceptedFormats: [] as string[],
      order: 999,
      uploadedDoc: d,
    }))

  return NextResponse.json({ docTypes: [...merged, ...unlinked] })
}

export async function POST(
  req: Request,
  { params }: { params: { studentId: string } },
) {
  const ctx = await getSchoolContext(req, ['ADMIN', 'TEACHER'])
    if (isApiError(ctx)) return ctx
    const { institutionId } = ctx

  const student = await prisma.student.findUnique({
    where: { id: params.studentId },
    select: { id: true, institutionId: true },
  })
  if (!student || student.institutionId !== institutionId) {
    return NextResponse.json({ error: 'Student not found' }, { status: 404 })
  }

  const body = await req.json()
  const { documentTypeConfigId, fileUrl, fileName, fileSize, mimeType, notes } = body

  if (!fileUrl || !fileName) {
    return NextResponse.json({ error: 'fileUrl and fileName required' }, { status: 400 })
  }

  // Resolve doc type name
  let docTypeName = body.documentTypeName ?? 'Other'
  if (documentTypeConfigId) {
    const dtc = await prisma.documentTypeConfig.findUnique({
      where: { id: documentTypeConfigId },
      select: { name: true },
    })
    if (dtc) docTypeName = dtc.name
  }

  const doc = await prisma.studentDocument.create({
    data: {
      institutionId,
      studentId: student.id,
      documentTypeConfigId: documentTypeConfigId || null,
      documentTypeName: docTypeName,
      fileUrl,
      fileName,
      fileSize: fileSize ?? null,
      mimeType: mimeType ?? null,
      notes: notes ?? null,
      uploadedById: ctx.userId,
    },
  })

  await prisma.auditLog.create({
    data: {
      institutionId,
      userId: ctx.userId,
      action: 'DOCUMENT_UPLOADED',
      tableName: 'StudentDocument',
      recordId: doc.id,
      after: { fileName, docTypeName },
    },
  })

  return NextResponse.json(doc, { status: 201 })
}
