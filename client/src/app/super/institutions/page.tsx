import { auth } from '@/server/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { InstitutionsClient } from '@/features/super/components/InstitutionsClient'

export default async function InstitutionsPage() {
    const session = await auth()
    if (!session || session.user.portalType !== 'SUPER_ADMIN') {
        redirect('/auth/login')
    }

    const institutions = await prisma.institution.findMany({
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
            billingEmail: true,
            _count: { select: { students: true, users: true } },
        },
    })

    return <InstitutionsClient institutions={institutions} />
}
