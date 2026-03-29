import { NextResponse } from 'next/server'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'
import { updateAdmissionSchema } from '@/features/admissions/schemas/admissionSchema'

interface Ctx { params: { id: string } }

export async function GET(req: Request, { params }: Ctx) {
  const ctx = await getSchoolContext(req, ['ADMIN', 'TEACHER'])
    if (isApiError(ctx)) return ctx
    const { institutionId } = ctx

  const admission = await prisma.admission.findFirst({
    where: { id: params.id, institutionId },
    include: {
      guardians: true,
      documents: { include: { documentTypeConfig: { select: { name: true } } } },
      student: { select: { id: true } },
    },
  })

  if (!admission) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  // Also return classes and audit logs for inline detail view
  const [classes, auditLogs] = await Promise.all([
    prisma.classYear.findMany({
      where: { institutionId, academicYear: { isCurrent: true } },
      orderBy: { classTemplate: { gradeLevel: 'asc' } },
      select: {
        id: true,
        classTemplate: { select: { name: true } },
        sections: { select: { id: true, name: true } },
      },
    }).then(cys => cys.map(cy => ({ id: cy.id, name: cy.classTemplate.name, sections: cy.sections }))),
    prisma.auditLog.findMany({
      where: { institutionId, recordId: admission.id, tableName: 'Admission' },
      orderBy: { createdAt: 'desc' },
      select: { action: true, after: true, createdAt: true },
      take: 20,
    }),
  ])

  return NextResponse.json({ admission, classes, auditLogs })
}

export async function PATCH(req: Request, { params }: Ctx) {
  const ctx = await getSchoolContext(req, ['ADMIN', 'TEACHER'])
    if (isApiError(ctx)) return ctx
    const { institutionId } = ctx

  const body = await req.json()
  const parsed = updateAdmissionSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid data' },
      { status: 400 },
    )
  }

  const existing = await prisma.admission.findFirst({
    where: { id: params.id, institutionId: institutionId },
    select: { id: true },
  })

  if (!existing) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const d = parsed.data
  const updated = await prisma.admission.update({
    where: { id: params.id },
    data: {
      ...d,
      ...(d.dateOfBirth && { dateOfBirth: new Date(d.dateOfBirth) }),
    },
    select: { id: true, applicationNo: true, status: true },
  })

  return NextResponse.json(updated)
}
