import { NextRequest, NextResponse } from 'next/server'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'

const STUDENT_SELECT = {
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
    sections: {
        where: { status: 'ACTIVE' as const },
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
} as const

export async function GET(
    req: NextRequest,
    { params }: { params: { studentId: string } },
) {
    const ctx = await getSchoolContext(req, ['ADMIN'])
    if (isApiError(ctx)) return ctx
    const { institutionId } = ctx

    const isNumeric = /^\d+$/.test(params.studentId)
    const student = await prisma.student.findUnique({
        where: isNumeric
            ? { serialNo: parseInt(params.studentId, 10) }
            : { id: params.studentId },
        select: { ...STUDENT_SELECT, institutionId: true },
    })

    if (!student) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    if (student.institutionId !== institutionId) {
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
    const ctx = await getSchoolContext(req, ['ADMIN'])
    if (isApiError(ctx)) return ctx
    const { institutionId } = ctx

    const isNum = /^\d+$/.test(params.studentId)
    const found = await prisma.student.findFirst({
        where: {
            institutionId: institutionId,
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
        'idProofType', 'idProofNumber', 'rollNo',
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
            institutionId: institutionId,
            userId: ctx.userId,
            action: 'STUDENT_UPDATED',
            tableName: 'Student',
            recordId: resolvedId,
            before: before as object,
            after: updated as object,
        },
    })

    return NextResponse.json(updated)
}
