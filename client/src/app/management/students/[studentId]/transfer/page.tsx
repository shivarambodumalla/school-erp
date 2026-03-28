import { auth } from '@/server/auth'
import { prisma } from '@/lib/prisma'
import { redirect, notFound } from 'next/navigation'
import { TransferOutClient } from '@/features/students/components/TransferOutClient'

export default async function TransferPage({
    params,
}: {
    params: { studentId: string }
}) {
    const session = await auth()
    if (!session) redirect('/auth/login')
    if (session.user.portalType !== 'ADMIN') redirect('/management/dashboard')

    const institutionId = session.user.institutionId

    const student = await prisma.student.findFirst({
        where: { id: params.studentId, institutionId, status: 'ACTIVE' },
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

    return (
        <TransferOutClient
            student={JSON.parse(JSON.stringify(student))}
        />
    )
}
