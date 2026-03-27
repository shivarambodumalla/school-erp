import { auth } from '@/server/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { InstitutionsClient } from '@/features/super/components/InstitutionsClient'

export default async function InstitutionsPage() {
  const session = await auth()
  if (!session || session.user.portalType !== 'SUPER_ADMIN') {
    redirect('/auth/login')
  }

  const pageSize = 20

  const [institutions, total] = await Promise.all([
    prisma.institution.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        subdomain: true,
        board: true,
        planTier: true,
        isActive: true,
        suspendedAt: true,
        createdAt: true,
        primaryColor: true,
        logoUrl: true,
        _count: { select: { students: true, users: true } },
      },
      take: pageSize,
    }),
    prisma.institution.count(),
  ])

  return (
    <InstitutionsClient
      initialData={{
        institutions: institutions.map((inst) => ({
          ...inst,
          createdAt: inst.createdAt.toISOString(),
          suspendedAt: inst.suspendedAt?.toISOString() ?? null,
        })),
        total,
        page: 1,
        totalPages: Math.ceil(total / pageSize),
      }}
    />
  )
}