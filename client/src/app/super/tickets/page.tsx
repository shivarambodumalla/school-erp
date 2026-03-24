import { auth } from '@/server/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { SuperTicketsClient } from '@/features/super/components/SuperTicketsClient'

export default async function SuperTicketsPage() {
    const session = await auth()
    if (!session || session.user.portalType !== 'SUPER_ADMIN') {
        redirect('/auth/login')
    }

    const [tickets, institutions] = await Promise.all([
        prisma.supportTicket.findMany({
            select: {
                id: true,
                title: true,
                description: true,
                priority: true,
                status: true,
                createdAt: true,
                institutionId: true,
                institution: { select: { name: true } },
                messages: {
                    select: { id: true, authorId: true, body: true, isInternal: true, createdAt: true },
                    orderBy: { createdAt: 'asc' },
                },
            },
            orderBy: { updatedAt: 'desc' },
        }),
        prisma.institution.findMany({
            select: { id: true, name: true },
            orderBy: { name: 'asc' },
        }),
    ])

    const ticketsWithInst = tickets.map((t) => ({
        ...t,
        institutionName: t.institution.name,
    }))

    return (
        <SuperTicketsClient
            tickets={ticketsWithInst}
            currentUserId={session.user.id}
            institutions={institutions}
        />
    )
}
