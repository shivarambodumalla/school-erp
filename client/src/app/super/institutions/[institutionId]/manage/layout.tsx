import { auth } from '@/server/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { SuperManageHeader } from
  '@/features/super/components/SuperManageHeader'
import { ManagementSidebar } from
  '@/components/layout/ManagementSidebar'
import { ALL_PERMISSIONS } from '@/lib/permissions'

export default async function SuperManageLayout({
  children,
  params,
}: {
  children: React.ReactNode
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
      primaryColor: true,
      logoUrl: true,
      isActive: true,
    },
  })

  if (!institution) redirect('/super/institutions')

  return (
    <div className="flex h-screen overflow-hidden">
      <SuperManageHeader
        institution={institution}
        backUrl={`/super/institutions/${params.institutionId}`}
      />
      <div className="flex flex-1 overflow-hidden pt-12">
        <ManagementSidebar
          permissions={ALL_PERMISSIONS}
          institutionName={institution.name}
          userEmail={session.user.email ?? ''}
          portalType="SUPER_ADMIN"
          logoUrl={institution.logoUrl}
          isSuperAdminManaging
          managingInstitutionId={params.institutionId}
        />
        <main className="flex-1 overflow-y-auto px-4 pb-4 pt-16 md:pt-6 md:px-6 md:pb-6 md:ml-64">
          {children}
        </main>
      </div>
    </div>
  )
}
