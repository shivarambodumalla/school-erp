import { auth } from '@/server/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { WhiteLabelTab } from
  '@/app/super/institutions/[institutionId]/_components/tabs/WhiteLabelTab'

export default async function SchoolWhiteLabelPage() {
  const session = await auth()
  if (!session) redirect('/auth/login')
  if (session.user.portalType !== 'ADMIN') redirect('/dashboard')

  const institution = await prisma.institution.findUnique({
    where: { id: session.user.institutionId },
    select: {
      id: true,
      name: true,
      primaryColor: true,
      secondaryColor: true,
      logoUrl: true,
      planTier: true,
      themePalette: true,
      themeAppliedAt: true,
    },
  })

  if (!institution) redirect('/dashboard')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Brand & Theme</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Customize your school&apos;s visual identity
        </p>
      </div>
      <WhiteLabelTab
        institution={{
          ...institution,
          themeAppliedAt:
            institution.themeAppliedAt?.toISOString() ?? null,
        }}
      />
    </div>
  )
}
