import { auth } from '@/server/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { SuperDashboardClient } from '@/features/super/components/SuperDashboardClient'

export default async function SuperDashboard() {
    const session = await auth()
    if (!session || session.user.portalType !== 'SUPER_ADMIN') {
        redirect('/auth/login')
    }

    const [
        institutionCount,
        userCount,
        studentCount,
        activeCount,
        recentInstitutions,
        openTickets,
        planBreakdown,
    ] = await Promise.all([
        prisma.institution.count(),
        prisma.user.count(),
        prisma.student.count(),
        prisma.institution.count({ where: { isActive: true } }),
        prisma.institution.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                name: true,
                subdomain: true,
                planTier: true,
                isActive: true,
                createdAt: true,
                _count: { select: { students: true, users: true } },
            },
        }),
        prisma.supportTicket.count({ where: { status: 'OPEN' } }),
        prisma.institution.groupBy({
            by: ['planTier'],
            _count: true,
        }),
    ])

    return (
        <SuperDashboardClient
            stats={{ institutionCount, userCount, studentCount, activeCount, openTickets }}
            recentInstitutions={recentInstitutions}
            planBreakdown={planBreakdown.map((p) => ({ planTier: p.planTier, _count: p._count }))}
        />
    )
}
