import { auth } from '@/server/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { NewAdmissionForm } from
  '@/features/admissions/components/NewAdmissionForm'

export default async function NewAdmissionPage() {
  const session = await auth()
  if (!session) redirect('/auth/login')

  const institutionId = session.user.institutionId

  const [academicYears, classes] = await Promise.all([
    prisma.academicYear.findMany({
      where: { institutionId },
      orderBy: { startDate: 'desc' },
      select: { id: true, name: true, isCurrent: true },
    }),
    prisma.classYear.findMany({
      where: { institutionId, academicYear: { isCurrent: true } },
      orderBy: { classTemplate: { gradeLevel: 'asc' } },
      select: {
        id: true,
        classTemplate: { select: { name: true } },
        sections: { select: { id: true, name: true } },
      },
    }).then(cys => cys.map(cy => ({ id: cy.id, name: cy.classTemplate.name, sections: cy.sections }))),
  ])

  return (
    <div className="max-w-3xl mx-auto">
      <NewAdmissionForm
        academicYears={academicYears}
        classes={classes}
      />
    </div>
  )
}
