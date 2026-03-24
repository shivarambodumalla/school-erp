import { auth } from '@/server/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { PlatformRolesClient } from '@/features/super/components/PlatformRolesClient'

export default async function PlatformRolesPage() {
    const session = await auth()
    if (!session || session.user.portalType !== 'SUPER_ADMIN') {
        redirect('/auth/login')
    }

    const roles = await prisma.platformRole.findMany({
        orderBy: { createdAt: 'asc' },
        select: {
            id: true,
            name: true,
            description: true,
            permissions: true,
            masqueradeMode: true,
            isSystemRole: true,
            createdAt: true,
            _count: { select: { users: true } },
        },
    })

    return <PlatformRolesClient roles={roles} />
}
