import { auth } from '@/server/auth'
import { prisma } from '@/lib/prisma'
import { redirect, notFound } from 'next/navigation'
import { InstitutionDetailClient } from '@/features/super/components/InstitutionDetailClient'

interface Props {
    params: { institutionId: string }
}

export default async function InstitutionDetailPage({ params }: Props) {
    const session = await auth()
    if (!session || session.user.portalType !== 'SUPER_ADMIN') {
        redirect('/auth/login')
    }

    const institution = await prisma.institution.findUnique({
        where: { id: params.institutionId },
        select: {
            id: true,
            name: true,
            subdomain: true,
            board: true,
            planTier: true,
            isActive: true,
            suspendedAt: true,
            suspendedReason: true,
            billingEmail: true,
            customPricing: true,
            createdAt: true,
            onboarding: {
                select: {
                    classesAdded: true,
                    staffAdded: true,
                    studentsAdded: true,
                    completedAt: true,
                },
            },
            _count: { select: { students: true, users: true } },
            users: {
                select: {
                    id: true,
                    email: true,
                    portalType: true,
                    isActive: true,
                    lastLoginAt: true,
                    createdAt: true,
                },
                orderBy: { createdAt: 'asc' },
            },
            tickets: {
                select: {
                    id: true,
                    title: true,
                    status: true,
                    priority: true,
                    createdAt: true,
                },
                orderBy: { createdAt: 'desc' },
                take: 20,
            },
        },
    })

    if (!institution) notFound()

    const auditLogs = await prisma.auditLog.findMany({
        where: { institutionId: params.institutionId },
        select: {
            id: true,
            action: true,
            tableName: true,
            recordId: true,
            userId: true,
            createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
    })

    const institutionWithAudit = {
        ...institution,
        customPricing: institution.customPricing?.toString() ?? null,
        auditLogs,
    }

    return <InstitutionDetailClient institution={institutionWithAudit} />
}
