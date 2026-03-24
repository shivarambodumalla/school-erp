import { auth } from '@/server/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { PlatformUsersClient } from '@/features/super/components/PlatformUsersClient'

export default async function PlatformUsersPage() {
    const session = await auth()
    if (!session || session.user.portalType !== 'SUPER_ADMIN') {
        redirect('/auth/login')
    }

    const [users, roles] = await Promise.all([
        prisma.platformUser.findMany({
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                email: true,
                isActive: true,
                lastLoginAt: true,
                createdAt: true,
                platformRole: { select: { id: true, name: true } },
            },
        }),
        prisma.platformRole.findMany({
            select: { id: true, name: true },
            orderBy: { name: 'asc' },
        }),
    ])

    return <PlatformUsersClient users={users} roles={roles} />
}
