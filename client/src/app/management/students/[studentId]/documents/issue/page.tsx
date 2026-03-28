import { auth } from '@/server/auth'
import { prisma } from '@/lib/prisma'
import { redirect, notFound } from 'next/navigation'
import { IssueDocumentClient } from '@/features/students/components/IssueDocumentClient'

export default async function IssueDocumentPage({
    params,
}: {
    params: { studentId: string }
}) {
    const session = await auth()
    if (!session) redirect('/auth/login')
    if (session.user.portalType !== 'ADMIN') redirect('/management/dashboard')

    const institutionId = session.user.institutionId

    const student = await prisma.student.findFirst({
        where: { id: params.studentId, institutionId },
        select: {
            id: true, firstName: true, middleName: true, lastName: true,
            sisId: true, admissionNo: true,
            sections: {
                where: { status: 'ACTIVE' },
                select: {
                    section: {
                        select: {
                            name: true,
                            classYear: { select: { classTemplate: { select: { name: true } } } },
                        },
                    },
                },
                take: 1,
            },
        },
    })
    if (!student) notFound()

    const institution = await prisma.institution.findUnique({
        where: { id: institutionId },
        select: {
            name: true, logoUrl: true, addressLine1: true,
            city: true, state: true, pinCode: true, phone: true,
        },
    })

    const settings = await prisma.admissionSettings.findUnique({
        where: { institutionId },
        select: { onDemandDocumentTypes: true },
    })

    const customTypes = (settings?.onDemandDocumentTypes ?? []) as string[]

    return (
        <IssueDocumentClient
            student={JSON.parse(JSON.stringify(student))}
            institution={JSON.parse(JSON.stringify(institution))}
            customDocTypes={customTypes}
        />
    )
}
