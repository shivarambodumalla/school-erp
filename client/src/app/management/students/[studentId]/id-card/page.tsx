import { auth } from '@/server/auth'
import { prisma } from '@/lib/prisma'
import { redirect, notFound } from 'next/navigation'
import { IdCardClient } from '@/features/students/components/IdCardClient'

export default async function IdCardPage({
    params,
}: {
    params: { studentId: string }
}) {
    const session = await auth()
    if (!session) redirect('/auth/login')
    if (session.user.portalType !== 'ADMIN') redirect('/management/dashboard')

    const student = await prisma.student.findFirst({
        where: { id: params.studentId, institutionId: session.user.institutionId },
        select: {
            id: true, firstName: true, middleName: true, lastName: true,
            sisId: true, admissionNo: true, rollNo: true,
            photoUrl: true, bloodGroup: true, gender: true,
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
        where: { id: session.user.institutionId },
        select: { name: true, logoUrl: true, primaryColor: true },
    })

    const activeCard = await prisma.studentIdCard.findFirst({
        where: { studentId: params.studentId, isActive: true },
        orderBy: { issuedAt: 'desc' },
        select: { id: true, issuedAt: true, validTill: true, fileUrl: true },
    })

    return (
        <IdCardClient
            student={JSON.parse(JSON.stringify(student))}
            institution={JSON.parse(JSON.stringify(institution))}
            activeCard={JSON.parse(JSON.stringify(activeCard))}
        />
    )
}
