import { prisma } from '@/lib/prisma'
import { auth } from '@/server/auth'
import { redirect } from 'next/navigation'
import { AdminUsersTable } from '@/features/admin/components/AdminUsersTable'
import type { User as PrismaUser, Institution } from '@prisma/client'

type UserWithInstitution = PrismaUser & {
    institution: Pick<Institution, 'id' | 'name' | 'subdomain' | 'board' | 'planTier'>
}

export default async function AdminUsersPage(): Promise<JSX.Element> {
    const session = await auth()
    if (!session) redirect('/auth/login')

    // Only ADMIN portal type can access this page
    if (session.user.portalType !== 'ADMIN') redirect('/dashboard')

    const users: UserWithInstitution[] = await prisma.user.findMany({
        include: {
            institution: {
                select: {
                    id: true,
                    name: true,
                    subdomain: true,
                    board: true,
                    planTier: true,
                },
            },
        },
        orderBy: { createdAt: 'desc' },
    })

    const formatted = users.map((u: UserWithInstitution) => ({
        id: u.id,
        email: u.email,
        portalType: u.portalType,
        isActive: u.isActive,
        lastLoginAt: u.lastLoginAt?.toISOString() ?? null,
        createdAt: u.createdAt.toISOString(),
        institution: {
            id: u.institution.id,
            name: u.institution.name,
            subdomain: u.institution.subdomain,
            board: u.institution.board,
            planTier: u.institution.planTier,
        },
    }))

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">All Users</h1>
                <p className="text-muted-foreground text-sm mt-1">
                    {formatted.length} users across all institutions
                </p>
            </div>
            <AdminUsersTable users={formatted} />
        </div>
    )
}
