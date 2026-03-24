import { auth } from '@/server/auth'
import { prisma } from '@/lib/prisma'
import { OnboardingWizard } from '@/features/onboarding/components/OnboardingWizard'

export default async function ManagementDashboard(): Promise<JSX.Element> {
    const session = await auth()

    const onboarding = session
        ? await prisma.onboardingStep.findUnique({
              where: { institutionId: session.user.institutionId },
              select: { completedAt: true },
          })
        : null

    const isOnboardingComplete = onboarding?.completedAt != null

    return (
        <div>
            {!isOnboardingComplete && session?.user.portalType === 'ADMIN' && (
                <OnboardingWizard
                    institutionId={session.user.institutionId}
                    institutionName={session.user.institutionName}
                />
            )}
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground mt-2">Welcome, {session?.user.email}</p>
            <p className="text-muted-foreground">Role: {session?.user.portalType}</p>
            <p className="text-muted-foreground">School: {session?.user.institutionName}</p>
            <p className="text-muted-foreground">Permissions: {session?.user.permissions.length} features enabled</p>
        </div>
    )
}
