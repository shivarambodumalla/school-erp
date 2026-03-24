import { auth } from '@/server/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { TicketsClient } from '@/features/tickets/components/TicketsClient'

export default async function TicketsPage() {
    const session = await auth()
    if (!session) redirect('/auth/login')

    const tickets = await prisma.supportTicket.findMany({
        where: { institutionId: session.user.institutionId },
        select: {
            id: true,
            title: true,
            description: true,
            priority: true,
            status: true,
            createdAt: true,
            messages: {
                where: { isInternal: false },
                select: { id: true, authorId: true, body: true, isInternal: true, createdAt: true },
                orderBy: { createdAt: 'asc' },
            },
        },
        orderBy: { updatedAt: 'desc' },
    })

    return (
        <TicketsClient
            tickets={tickets}
            currentUserId={session.user.id}
            isSuperAdmin={false}
        />
    )
}
