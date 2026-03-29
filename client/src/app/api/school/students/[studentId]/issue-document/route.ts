import { NextRequest, NextResponse } from 'next/server'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'

export async function POST(
    req: NextRequest,
    { params }: { params: { studentId: string } },
) {
    const ctx = await getSchoolContext(req, ['ADMIN'])
    if (isApiError(ctx)) return ctx
    const { institutionId } = ctx

    const student = await prisma.student.findFirst({
        where: { id: params.studentId, institutionId },
        select: {
            id: true, firstName: true, middleName: true, lastName: true,
            sisId: true, admissionNo: true, rollNo: true,
            dateOfBirth: true, gender: true, bloodGroup: true,
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
            createdAt: true,
        },
    })
    if (!student) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const institution = await prisma.institution.findUnique({
        where: { id: institutionId },
        select: {
            name: true, logoUrl: true, addressLine1: true,
            addressLine2: true, city: true, state: true, pinCode: true,
            phone: true,
        },
    })

    const body = await req.json()
    const { documentType, notes } = body

    await prisma.auditLog.create({
        data: {
            institutionId,
            userId: ctx.userId,
            action: 'DOCUMENT_ISSUED',
            tableName: 'Student',
            recordId: student.id,
            after: { documentType, issuedTo: student.firstName },
        },
    })

    return NextResponse.json({
        documentType,
        notes,
        studentData: student,
        institutionData: institution,
        issuedAt: new Date().toISOString(),
        issuedBy: ctx.userId,
    })
}
