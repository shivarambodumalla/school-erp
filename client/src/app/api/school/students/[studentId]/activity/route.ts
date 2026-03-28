import { NextResponse } from 'next/server'
import { auth } from '@/server/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: Request,
  { params }: { params: { studentId: string } },
) {
  const session = await auth()
  if (!session || !['ADMIN', 'TEACHER'].includes(session.user.portalType)) {
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

  const [incidents, achievements, counsellorNotes] = await Promise.all([
    prisma.behaviourIncident.findMany({
      where: { studentId: student.id, institutionId },
      orderBy: { date: 'desc' },
      take: 10,
    }),
    prisma.achievement.findMany({
      where: { studentId: student.id, institutionId },
      orderBy: { date: 'desc' },
    }),
    // Only return counsellor notes for ADMIN
    session.user.portalType === 'ADMIN'
      ? prisma.counsellorNote.findMany({
          where: { studentId: student.id, institutionId },
          orderBy: { createdAt: 'desc' },
        })
      : Promise.resolve([]),
  ])

  return NextResponse.json({ incidents, achievements, counsellorNotes })
}
