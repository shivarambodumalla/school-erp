import { auth } from '@/server/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { CalendarClient } from '@/features/calendar/components/CalendarClient'

export default async function CalendarPage() {
    const session = await auth()
    if (!session) redirect('/auth/login')

    const events = await prisma.schoolCalendarEvent.findMany({
        where: { institutionId: session.user.institutionId },
        select: {
            id: true,
            title: true,
            description: true,
            type: true,
            startDate: true,
            endDate: true,
            isHoliday: true,
        },
        orderBy: { startDate: 'asc' },
    })

    return <CalendarClient events={events} />
}
