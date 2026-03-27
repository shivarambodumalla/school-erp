import { auth } from '@/server/auth'
import { redirect } from 'next/navigation'
import { OnboardingWizard } from
  '@/features/onboarding/components/OnboardingWizard'
import { OverviewTab } from
  '@/app/super/institutions/[institutionId]/_components/tabs/OverviewTab'
import { prisma } from '@/lib/prisma'

export default async function ManagementDashboard() {
  const session = await auth()
  if (!session || session.user.portalType !== 'ADMIN') {
    redirect('/auth/login')
  }

  const institutionId = session.user.institutionId

  const onboarding = await prisma.onboardingStep.findUnique({
    where: { institutionId },
    select: { completedAt: true, classesAdded: true, staffAdded: true, studentsAdded: true },
  })

  const isOnboardingComplete = onboarding?.completedAt != null

  return (
    <div className="space-y-6">
      {!isOnboardingComplete && (
        <OnboardingWizard
          institutionId={institutionId}
          institutionName={session.user.institutionName}
        />
      )}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Welcome back, {session.user.email?.split('@')[0]}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Here&apos;s an overview of {session.user.institutionName}
        </p>
      </div>
      <OverviewTab
        institutionId={institutionId}
        apiBase="/api/school"
        isSchoolAdmin
      />
    </div>
  )
}
