'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { auth } from '@/server/auth'

interface CreateEventData {
    title: string
    type: 'HOLIDAY' | 'EXAM' | 'EVENT' | 'MEETING' | 'DEADLINE' | 'OTHER'
    startDate: string
    endDate: string
    isHoliday: boolean
    description?: string
}

export async function createCalendarEvent(data: CreateEventData) {
    const session = await auth()
    if (!session) throw new Error('Unauthorized')

    await prisma.schoolCalendarEvent.create({
        data: {
            institutionId: session.user.institutionId,
            title: data.title,
            type: data.type,
            startDate: new Date(data.startDate),
            endDate: new Date(data.endDate),
            isHoliday: data.isHoliday,
            description: data.description,
            createdById: session.user.id,
        },
    })

    revalidatePath('/management/calendar')
}
