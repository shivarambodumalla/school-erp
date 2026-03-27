import { auth } from '@/server/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { WhiteLabelTab } from
  '@/app/super/institutions/[institutionId]/_components/tabs/WhiteLabelTab'

export default async function SettingsBrandingPage() {
  const session = await auth()
  if (!session) redirect('/auth/login')

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

  if (!institution) redirect('/management/dashboard')

  return (
    <WhiteLabelTab
      institution={{
        ...institution,
        themeAppliedAt: institution.themeAppliedAt?.toISOString() ?? null,
      }}
    />
  )
}