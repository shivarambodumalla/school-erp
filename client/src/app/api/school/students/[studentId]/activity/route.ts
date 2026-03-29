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
    ctx.portalType === 'ADMIN'
      ? prisma.counsellorNote.findMany({
          where: { studentId: student.id, institutionId },
          orderBy: { createdAt: 'desc' },
        })
      : Promise.resolve([]),
  ])

  return NextResponse.json({ incidents, achievements, counsellorNotes })
}
