import { auth } from '@/server/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { DocumentsClient } from '@/features/documents/components/DocumentsClient'

export default async function DocumentsPage() {
    const session = await auth()
    if (!session) redirect('/auth/login')

    const documents = await prisma.document.findMany({
        where: { institutionId: session.user.institutionId },
        select: {
            id: true,
            name: true,
            type: true,
            fileUrl: true,
            fileSize: true,
            mimeType: true,
            isVerified: true,
            createdAt: true,
            studentId: true,
            uploadedById: true,
        },
        orderBy: { createdAt: 'desc' },
    })

    return <DocumentsClient documents={documents} institutionId={session.user.institutionId} />
}
