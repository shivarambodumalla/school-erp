'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { auth } from '@/server/auth'

interface CreateDocumentData {
    institutionId: string
    name: string
    type: 'TRANSFER_CERTIFICATE' | 'ADMISSION_FORM' | 'MARKSHEET' | 'ID_PROOF' | 'MEDICAL_RECORD' | 'STAFF_CONTRACT' | 'OTHER'
    fileUrl: string
    fileSize: number
    mimeType: string
    studentId?: string
}

export async function createDocument(data: CreateDocumentData) {
    const session = await auth()
    if (!session) throw new Error('Unauthorized')

    await prisma.document.create({
        data: {
            institutionId: data.institutionId,
            name: data.name,
            type: data.type,
            fileUrl: data.fileUrl,
            fileSize: data.fileSize,
            mimeType: data.mimeType,
            studentId: data.studentId,
            uploadedById: session.user.id,
        },
    })

    revalidatePath('/management/documents')
}
