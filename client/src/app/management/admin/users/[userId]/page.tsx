import { prisma } from '@/lib/prisma'
import { auth } from '@/server/auth'
import { redirect, notFound } from 'next/navigation'
import { UserProfile } from '@/features/admin/components/UserProfile'
import type { User as PrismaUser, Institution } from '@prisma/client'

type UserWithInstitution = PrismaUser & {
    institution: Pick<Institution, 'id' | 'name' | 'subdomain' | 'board' | 'planTier' | 'primaryColor' | 'createdAt'>
}

interface Props {
    params: { userId: string }
}

export default async function UserDetailPage({ params }: Props): Promise<JSX.Element> {
    const session = await auth()
    if (!session) redirect('/auth/login')
    if (session.user.portalType !== 'ADMIN' && session.user.portalType !== 'SUPER_ADMIN') {
        redirect('/dashboard')
    }

    const user: UserWithInstitution | null = await prisma.user.findUnique({
        where: { id: params.userId },
        include: {
            institution: {
                select: {
                    id: true,
                    name: true,
                    subdomain: true,
                    board: true,
                    planTier: true,
                    primaryColor: true,
                    createdAt: true,
                },
            },
        },
    })

    if (!user) notFound()

    // Non-super-admin can only view users in their own institution
    if (
        session.user.portalType !== 'SUPER_ADMIN' &&
        user.institutionId !== session.user.institutionId
    ) {
        redirect('/dashboard')
    }

    const formatted = {
        id: user.id,
        email: user.email,
        portalType: user.portalType,
        isActive: user.isActive,
        lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
        createdAt: user.createdAt.toISOString(),
        institution: {
            id: user.institution.id,
            name: user.institution.name,
            subdomain: user.institution.subdomain,
            board: user.institution.board,
            planTier: user.institution.planTier,
            primaryColor: user.institution.primaryColor,
            createdAt: user.institution.createdAt.toISOString(),
        },
    }

    return <UserProfile user={formatted} initiatorPortalType={session.user.portalType} />
}
