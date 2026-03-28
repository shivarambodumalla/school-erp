import { auth } from '@/server/auth'
import { prisma } from '@/lib/prisma'
import { redirect, notFound } from 'next/navigation'
import { AdmissionDetailClient } from
  '@/features/admissions/components/AdmissionDetailClient'

export default async function AdmissionDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await auth()
  if (!session) redirect('/auth/login')

  const institutionId = session.user.institutionId

  const admission = await prisma.admission.findFirst({
    where: { id: params.id, institutionId },
    include: {
      guardians: true,
      documents: {
        include: { documentTypeConfig: { select: { name: true } } },
      },
      student: { select: { id: true } },
    },
  })

  if (!admission) notFound()

  const classes = await prisma.classYear.findMany({
    where: { institutionId, academicYear: { isCurrent: true } },
    orderBy: { classTemplate: { gradeLevel: 'asc' } },
    select: {
      id: true,
      classTemplate: { select: { name: true } },
      sections: { select: { id: true, name: true } },
    },
  }).then(cys => cys.map(cy => ({ id: cy.id, name: cy.classTemplate.name, sections: cy.sections })))

  const auditLogs = await prisma.auditLog.findMany({
    where: { institutionId, recordId: admission.id, tableName: 'Admission' },
    orderBy: { createdAt: 'desc' },
    select: { action: true, after: true, createdAt: true },
    take: 20,
  })

  return (
    <AdmissionDetailClient
      admission={JSON.parse(JSON.stringify(admission))}
      classes={classes}
      auditLogs={JSON.parse(JSON.stringify(auditLogs))}
    />
  )
}
