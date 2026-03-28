import { auth } from '@/server/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { AdmissionSettingsClient } from '@/features/settings/components/AdmissionSettingsClient'

export default async function AdmissionSettingsPage() {
    const session = await auth()
    if (!session) redirect('/auth/login')
    if (session.user.portalType !== 'ADMIN') redirect('/management/dashboard')

    const institutionId = session.user.institutionId

    const [settings, documentTypes] = await Promise.all([
        prisma.admissionSettings.upsert({
            where: { institutionId },
            create: { institutionId },
            update: {},
        }),
        prisma.documentTypeConfig.findMany({
            where: { institutionId },
            orderBy: { order: 'asc' },
        }),
    ])

    return (
        <AdmissionSettingsClient
            settings={JSON.parse(JSON.stringify(settings))}
            documentTypes={JSON.parse(JSON.stringify(documentTypes))}
        />
    )
}
