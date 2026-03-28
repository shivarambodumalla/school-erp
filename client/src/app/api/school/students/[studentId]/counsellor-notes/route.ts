import { NextResponse } from 'next/server'
import { auth } from '@/server/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  req: Request,
  { params }: { params: { studentId: string } },
) {
  const session = await auth()
  if (!session || session.user.portalType !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const institutionId = session.user.institutionId

  const student = await prisma.student.findUnique({
    where: { id: params.studentId },
    select: { id: true, institutionId: true },
  })
  if (!student || student.institutionId !== institutionId) {
    return NextResponse.json({ error: 'Student not found' }, { status: 404 })
  }

  const body = await req.json()
  const { note, followUpDate } = body

  if (!note) {
    return NextResponse.json({ error: 'note is required' }, { status: 400 })
  }

  const record = await prisma.counsellorNote.create({
    data: {
      institutionId,
      studentId: student.id,
      note,
      followUpDate: followUpDate ? new Date(followUpDate) : null,
      createdById: session.user.id,
    },
  })

  await prisma.auditLog.create({
    data: {
      institutionId,
      userId: session.user.id,
      action: 'COUNSELLOR_NOTE_ADDED',
      tableName: 'CounsellorNote',
      recordId: record.id,
      after: { hasFollowUp: !!followUpDate },
    },
  })

  return NextResponse.json(record, { status: 201 })
}
