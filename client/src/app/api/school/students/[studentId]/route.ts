import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/server/auth'
import { prisma } from '@/lib/prisma'

const STUDENT_SELECT = {
    id: true, sisId: true, admissionNo: true, rollNo: true,
    status: true, photoUrl: true,
    firstName: true, middleName: true, lastName: true,
    dateOfBirth: true, gender: true, bloodGroup: true,
    nationality: true, religion: true, motherTongue: true,
    idProofType: true, idProofNumber: true,
    classId: true, sectionId: true, createdAt: true,
    allergies: true, medicalConditions: true,
    emergencyDoctorName: true, emergencyDoctorPhone: true,
    transportMode: true, busRouteId: true,
    pickupStop: true, dropStop: true,
    boardingType: true, hostelRoom: true,
    class: { select: { id: true, name: true, gradeLevel: true, academicYearId: true } },
    section: { select: { id: true, name: true } },
    admission: { select: { id: true, applicationNo: true, admissionNo: true, admissionType: true } },
    guardians: {
        select: {
            id: true, type: true, relationship: true, name: true,
            phone: true, alternatePhone: true, email: true,
            isPrimaryContact: true, isEmergencyContact: true,
            canLogin: true, userId: true,
        },
    },
} as const

export async function GET(
    _req: NextRequest,
    { params }: { params: { studentId: string } },
) {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    const isNumeric = /^\d+$/.test(params.studentId)
    const student = await prisma.student.findUnique({
        where: isNumeric
            ? { serialNo: parseInt(params.studentId, 10) }
            : { id: params.studentId },
        select: { ...STUDENT_SELECT, institutionId: true },
    })

    if (!student || student.class === null) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    if (student.institutionId !== session.user.institutionId) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { institutionId: _strip, ...safeStudent } = student

    return NextResponse.json(safeStudent)
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: { studentId: string } },
) {
    const session = await auth()
    if (!session || session.user.portalType !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }

    const isNum = /^\d+$/.test(params.studentId)
    const found = await prisma.student.findFirst({
        where: {
            institutionId: session.user.institutionId,
            ...(isNum ? { serialNo: parseInt(params.studentId, 10) } : { id: params.studentId }),
        },
        select: { id: true },
    })
    if (!found) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const resolvedId = found.id

    const body = await req.json()
    const allowedFields = [
        'firstName', 'middleName', 'lastName', 'dateOfBirth', 'gender',
        'bloodGroup', 'nationality', 'religion', 'motherTongue', 'photoUrl',
        'idProofType', 'idProofNumber', 'rollNo', 'classId', 'sectionId',
        'allergies', 'medicalConditions', 'emergencyDoctorName', 'emergencyDoctorPhone',
        'transportMode', 'busRouteId', 'pickupStop', 'dropStop',
        'boardingType', 'hostelRoom', 'status',
    ]

    const data: Record<string, unknown> = {}
    for (const key of allowedFields) {
        if (key in body) data[key] = body[key]
    }

    const before = await prisma.student.findUnique({
        where: { id: resolvedId },
        select: STUDENT_SELECT,
    })

    const updated = await prisma.student.update({
        where: { id: resolvedId },
        data,
        select: STUDENT_SELECT,
    })

    await prisma.auditLog.create({
        data: {
            institutionId: session.user.institutionId,
            userId: session.user.id,
            action: 'STUDENT_UPDATED',
            tableName: 'Student',
            recordId: resolvedId,
            before: before as object,
            after: updated as object,
        },
    })

    return NextResponse.json(updated)
}
