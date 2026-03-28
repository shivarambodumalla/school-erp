import { NextResponse } from 'next/server'
import { auth } from '@/server/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  req: Request,
  { params }: { params: { studentId: string; docId: string } },
) {
  const session = await auth()
  if (!session || session.user.portalType !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const institutionId = session.user.institutionId

  const doc = await prisma.studentDocument.findFirst({
    where: { id: params.docId, studentId: params.studentId, institutionId },
  })
  if (!doc) {
    return NextResponse.json({ error: 'Document not found' }, { status: 404 })
  }

  const body = await req.json()
  const updateData: Record<string, unknown> = {}

  if (typeof body.isVerified === 'boolean') {
    updateData.isVerified = body.isVerified
    if (body.isVerified) {
      updateData.verifiedById = session.user.id
      updateData.verifiedAt = new Date()
    } else {
      updateData.verifiedById = null
      updateData.verifiedAt = null
    }
  }
  if (typeof body.notes === 'string') {
    updateData.notes = body.notes
  }

  const updated = await prisma.studentDocument.update({
    where: { id: params.docId },
    data: updateData,
  })

  return NextResponse.json(updated)
}

export async function DELETE(
  _req: Request,
  { params }: { params: { studentId: string; docId: string } },
) {
  const session = await auth()
  if (!session || session.user.portalType !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const institutionId = session.user.institutionId

  const doc = await prisma.studentDocument.findFirst({
    where: { id: params.docId, studentId: params.studentId, institutionId },
  })
  if (!doc) {
    return NextResponse.json({ error: 'Document not found' }, { status: 404 })
  }

  await prisma.studentDocument.delete({ where: { id: params.docId } })

  await prisma.auditLog.create({
    data: {
      institutionId,
      userId: session.user.id,
      action: 'DOCUMENT_DELETED',
      tableName: 'StudentDocument',
      recordId: params.docId,
      before: { fileName: doc.fileName, docTypeName: doc.documentTypeName },
    },
  })

  return NextResponse.json({ ok: true })
}
