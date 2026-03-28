import { auth } from '@/server/auth'
import { prisma } from '@/lib/prisma'
import { redirect, notFound } from 'next/navigation'
import { StudentProfileClient } from '@/features/students/components/StudentProfileClient'

export default async function StudentProfilePage({
    params,
}: {
    params: { studentId: string }
}) {
    const session = await auth()
    if (!session) redirect('/auth/login')

    const portal = session.user.portalType
    if (portal !== 'ADMIN' && portal !== 'TEACHER') redirect('/management/dashboard')

    const isNumeric = /^\d+$/.test(params.studentId)
    const student = await prisma.student.findUnique({
        where: isNumeric
            ? { serialNo: parseInt(params.studentId, 10) }
            : { id: params.studentId },
        select: {
            id: true, sisId: true, admissionNo: true, rollNo: true,
            status: true, photoUrl: true,
            firstName: true, middleName: true, lastName: true,
            dateOfBirth: true, gender: true, bloodGroup: true,
            nationality: true, religion: true, motherTongue: true,
            idProofType: true, idProofNumber: true,
            createdAt: true,
            allergies: true, medicalConditions: true,
            emergencyDoctorName: true, emergencyDoctorPhone: true,
            transportMode: true, busRouteId: true,
            pickupStop: true, dropStop: true,
            boardingType: true, hostelRoom: true,
            institutionId: true,
            sections: {
                where: { status: 'ACTIVE' },
                select: {
                    section: { select: { id: true, name: true } },
                    classYear: {
                        select: {
                            id: true,
                            academicYearId: true,
                            classTemplate: { select: { id: true, name: true, gradeLevel: true } },
                        },
                    },
                },
                take: 1,
            },
            admission: { select: { id: true, applicationNo: true, admissionNo: true, admissionType: true } },
            guardians: {
                select: {
                    id: true, type: true, relationship: true, name: true,
                    phone: true, alternatePhone: true, email: true,
                    isPrimaryContact: true, isEmergencyContact: true,
                    canLogin: true, userId: true,
                },
            },
        },
    })

    if (!student || student.institutionId !== session.user.institutionId) {
        notFound()
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { institutionId: _strip, ...studentData } = student

    return <StudentProfileClient student={JSON.parse(JSON.stringify(studentData))} portalType={session.user.portalType} />
}
