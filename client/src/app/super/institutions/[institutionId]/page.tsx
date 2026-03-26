import { auth } from '@/server/auth'
import { prisma } from '@/lib/prisma'
import { redirect, notFound } from 'next/navigation'
import { InstitutionHero } from
  './_components/InstitutionHero'
import { InstitutionTabs } from
  './_components/InstitutionTabs'

export default async function InstitutionDetailPage({
  params,
}: {
  params: { institutionId: string }
}) {
  const session = await auth()
  if (!session || session.user.portalType !== 'SUPER_ADMIN') {
    redirect('/auth/login')
  }

  const institution = await prisma.institution.findUnique({
    where: { id: params.institutionId },
    select: {
      id: true,
      name: true,
      subdomain: true,
      institutionType: true,
      board: true,
      planTier: true,
      primaryColor: true,
      secondaryColor: true,
      logoUrl: true,
      isActive: true,
      suspendedAt: true,
      suspendedReason: true,
      createdAt: true,
      addressLine1: true,
      addressLine2: true,
      city: true,
      state: true,
      pinCode: true,
      phone: true,
      website: true,
      billingEmail: true,
      establishedYear: true,
      studentCapacity: true,
      themePalette: true,
      themeAppliedAt: true,
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

  if (!institution) notFound()

  const lastActivity = await prisma.user.findFirst({
    where: {
      institutionId: params.institutionId,
      lastLoginAt: { not: null },
    },
    orderBy: { lastLoginAt: 'desc' },
    select: {
      lastLoginAt: true,
      email: true,
      portalType: true,
    },
  })

  const openTickets = await prisma.supportTicket.count({
    where: {
      institutionId: params.institutionId,
      status: 'OPEN',
    },
  })

  return (
    <div className="space-y-6">
      <InstitutionHero
        institution={{
          ...institution,
          createdAt: institution.createdAt.toISOString(),
          suspendedAt: institution.suspendedAt?.toISOString() ?? null,
          themeAppliedAt: institution.themeAppliedAt?.toISOString() ?? null,
          onboarding: institution.onboarding
            ? {
                ...institution.onboarding,
                completedAt:
                  institution.onboarding.completedAt?.toISOString() ?? null,
              }
            : null,
        }}
        editData={{
          id: institution.id,
          name: institution.name,
          subdomain: institution.subdomain,
          institutionType: institution.institutionType,
          board: institution.board,
          planTier: institution.planTier,
          addressLine1: institution.addressLine1,
          addressLine2: institution.addressLine2,
          city: institution.city,
          state: institution.state,
          pinCode: institution.pinCode,
          phone: institution.phone,
          website: institution.website,
          establishedYear: institution.establishedYear,
          studentCapacity: institution.studentCapacity,
          billingEmail: institution.billingEmail,
        }}
        lastActivity={
          lastActivity
            ? {
                lastLoginAt:
                  lastActivity.lastLoginAt?.toISOString() ?? null,
                email: lastActivity.email,
                portalType: lastActivity.portalType,
              }
            : null
        }
        openTickets={openTickets}
      />
      <InstitutionTabs
        institutionId={params.institutionId}
        apiBase={`/api/super/institutions/${params.institutionId}`}
        institution={{
          id: institution.id,
          name: institution.name,
          primaryColor: institution.primaryColor,
          secondaryColor: institution.secondaryColor,
          logoUrl: institution.logoUrl,
          planTier: institution.planTier,
          themePalette: institution.themePalette,
          themeAppliedAt:
            institution.themeAppliedAt?.toISOString() ?? null,
        }}
      />
    </div>
  )
}
