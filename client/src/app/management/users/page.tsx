import { prisma } from '@/lib/prisma'
import { auth } from '@/server/auth'
import { redirect } from 'next/navigation'
import { UsersTable } from '@/features/users/components/UsersTable'
import type { User as PrismaUser, Institution } from '@prisma/client'

type UserWithInstitution = PrismaUser & { institution: Pick<Institution, 'name'> }

export default async function UsersPage(): Promise<JSX.Element> {
    const session = await auth()
    if (!session) redirect('/auth/login')

    const users: UserWithInstitution[] = await prisma.user.findMany({
        where: {
            institutionId: session.user.institutionId,
        },
        include: {
            institution: {
                select: { name: true },
            },
        },
        orderBy: { createdAt: 'desc' },
    })

    const formattedUsers = users.map((u: UserWithInstitution) => ({
        id: u.id,
        email: u.email,
        portalType: u.portalType,
        isActive: u.isActive,
        lastLoginAt: u.lastLoginAt?.toISOString() ?? null,
        createdAt: u.createdAt.toISOString(),
    }))

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Users</h1>
                <p className="text-muted-foreground text-sm mt-1">
                    All users in {session.user.institutionName}
                </p>
            </div>
            <UsersTable users={formattedUsers} />
        </div>
    )
}
