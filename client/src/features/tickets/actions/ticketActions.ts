'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { auth } from '@/server/auth'

interface CreateTicketData {
    title: string
    description: string
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
}

export async function createTicket(data: CreateTicketData) {
    const session = await auth()
    if (!session) throw new Error('Unauthorized')

    await prisma.supportTicket.create({
        data: {
            institutionId: session.user.institutionId,
            raisedById: session.user.id,
            title: data.title,
            description: data.description,
            priority: data.priority,
        },
    })

    revalidatePath('/management/tickets')
}

export async function replyToTicket(ticketId: string, body: string, isInternal = false) {
    const session = await auth()
    if (!session) throw new Error('Unauthorized')

    await prisma.ticketMessage.create({
        data: { ticketId, authorId: session.user.id, body, isInternal },
    })

    await prisma.supportTicket.update({
        where: { id: ticketId },
        data: { updatedAt: new Date() },
    })

    revalidatePath('/management/tickets')
    revalidatePath('/super/tickets')
}

export async function updateTicketStatus(ticketId: string, status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED') {
    const session = await auth()
    if (!session) throw new Error('Unauthorized')

    await prisma.supportTicket.update({
        where: { id: ticketId },
        data: {
            status,
            resolvedById: status === 'RESOLVED' ? session.user.id : undefined,
            resolvedAt: status === 'RESOLVED' ? new Date() : undefined,
        },
    })

    revalidatePath('/management/tickets')
    revalidatePath('/super/tickets')
}
