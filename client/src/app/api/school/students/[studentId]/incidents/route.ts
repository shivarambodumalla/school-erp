import { NextResponse } from 'next/server'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'

export async function POST(
  req: Request,
  { params }: { params: { studentId: string } },
) {
  const ctx = await getSchoolContext(req, ['ADMIN'])
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
  const { type, date, description, actionTaken, severity, parentNotified } = body

  if (!type || !date || !description || !severity) {
    return NextResponse.json(
      { error: 'type, date, description, and severity are required' },
      { status: 400 },
    )
  }

  const incident = await prisma.behaviourIncident.create({
    data: {
      institutionId,
      studentId: student.id,
      type,
      date: new Date(date),
      description,
      actionTaken: actionTaken || null,
      severity,
      reportedById: ctx.userId,
      parentNotified: parentNotified ?? false,
    },
  })

  await prisma.auditLog.create({
    data: {
      institutionId,
      userId: ctx.userId,
      action: 'INCIDENT_LOGGED',
      tableName: 'BehaviourIncident',
      recordId: incident.id,
      after: { type, severity },
    },
  })

  return NextResponse.json(incident, { status: 201 })
}
