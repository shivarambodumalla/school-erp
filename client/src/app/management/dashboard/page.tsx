import { auth } from '@/server/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { OnboardingWizard } from
  '@/features/onboarding/components/OnboardingWizard'
import { SchoolHero } from
  '@/features/school/components/SchoolHero'
import { OverviewTab } from
  '@/app/super/institutions/[institutionId]/_components/tabs/OverviewTab'

export default async function ManagementDashboard() {
  const session = await auth()
  if (!session || session.user.portalType !== 'ADMIN') {
    redirect('/auth/login')
  }

  const institutionId = session.user.institutionId

  const institution = await prisma.institution.findUnique({
    where: { id: institutionId },
    select: {
      id: true,
      name: true,
      subdomain: true,
      institutionType: true,
      board: true,
      planTier: true,
      primaryColor: true,
      logoUrl: true,
      isActive: true,
      city: true,
      state: true,
      createdAt: true,
      onboarding: {
        select: {
          classesAdded: true,
          staffAdded: true,
          studentsAdded: true,
          completedAt: true,
        },
      },
      _count: {
        select: {
          users: true,
          students: true,
        },
      },
    },
  })

  if (!institution) redirect('/auth/login')

  const openTickets = await prisma.supportTicket.count({
    where: { institutionId, status: 'OPEN' },
  })

  const isOnboardingComplete = institution.onboarding?.completedAt != null

  return (
    <div className="space-y-6">
      {!isOnboardingComplete && (
        <OnboardingWizard
          institutionId={institutionId}
          institutionName={session.user.institutionName}
        />
      )}
      <SchoolHero
        institution={{
          ...institution,
          createdAt: institution.createdAt.toISOString(),
          onboarding: institution.onboarding
            ? {
                ...institution.onboarding,
                completedAt:
                  institution.onboarding.completedAt?.toISOString() ?? null,
              }
            : null,
        }}
        openTickets={openTickets}
      />
      <OverviewTab
        institutionId={institutionId}
        apiBase="/api/school"
        isSchoolAdmin
      />
    </div>
  )
}
