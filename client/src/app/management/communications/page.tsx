import { auth } from '@/server/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { CommunicationLogClient } from '@/features/communications/components/CommunicationLogClient'

export default async function CommunicationsPage() {
    const session = await auth()
    if (!session) redirect('/auth/login')

    const logs = await prisma.parentCommunicationLog.findMany({
        where: { institutionId: session.user.institutionId },
        select: {
            id: true,
            channel: true,
            subject: true,
            body: true,
            status: true,
            sentAt: true,
            studentId: true,
        },
        orderBy: { sentAt: 'desc' },
        take: 200,
    })

    return <CommunicationLogClient logs={logs} />
}
