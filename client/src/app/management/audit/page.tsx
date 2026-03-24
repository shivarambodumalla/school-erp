import { auth } from '@/server/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { AuditLogClient } from '@/features/audit/components/AuditLogClient'

export default async function AuditPage() {
    const session = await auth()
    if (!session) redirect('/auth/login')

    const logs = await prisma.auditLog.findMany({
        where: { institutionId: session.user.institutionId },
        select: {
            id: true,
            action: true,
            tableName: true,
            recordId: true,
            before: true,
            after: true,
            createdAt: true,
            userId: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 100,
    })

    return <AuditLogClient logs={logs} />
}
