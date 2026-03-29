import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { WhiteLabelTab } from
  '@/app/super/institutions/[institutionId]/_components/tabs/WhiteLabelTab'

export default async function SuperManageWhitelabel({
  params,
}: {
  params: { institutionId: string }
}) {
  const institution = await prisma.institution.findUnique({
    where: { id: params.institutionId },
    select: {
      id: true,
      name: true,
      primaryColor: true,
      secondaryColor: true,
      logoUrl: true,
      squareLogoUrl: true,
      faviconUrl: true,
      planTier: true,
      themePalette: true,
      themeAppliedAt: true,
    },
  })

  if (!institution) notFound()

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">White Label</h1>
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
