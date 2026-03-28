import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/server/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
    _req: NextRequest,
    { params }: { params: { studentId: string } },
) {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    const student = await prisma.student.findFirst({
        where: { id: params.studentId, institutionId: session.user.institutionId },
        select: { id: true },
    })
    if (!student) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const idCard = await prisma.studentIdCard.findFirst({
        where: { studentId: params.studentId, isActive: true },
        orderBy: { issuedAt: 'desc' },
        select: { id: true, issuedAt: true, validTill: true, fileUrl: true, isActive: true },
    })

    return NextResponse.json({ idCard })
}

export async function POST(
    req: NextRequest,
    { params }: { params: { studentId: string } },
) {
    const session = await auth()
    if (!session || session.user.portalType !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }

    const student = await prisma.student.findFirst({
        where: { id: params.studentId, institutionId: session.user.institutionId },
        select: {
            id: true,
            sections: {
                where: { status: 'ACTIVE' },
                select: { classYear: { select: { academicYearId: true } } },
                take: 1,
            },
        },
    })
    if (!student) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const body = await req.json()
    let validTill: Date

    if (body.validTill) {
        validTill = new Date(body.validTill)
    } else {
        const settings = await prisma.admissionSettings.findUnique({
            where: { institutionId: session.user.institutionId },
            select: { idCardValidTill: true },
        })
        if (settings?.idCardValidTill) {
            validTill = settings.idCardValidTill
        } else {
            const ay = await prisma.academicYear.findFirst({
                where: { id: student.sections[0]?.classYear.academicYearId ?? '' },
                select: { endDate: true },
            })
            validTill = ay?.endDate ?? new Date(new Date().getFullYear() + 1, 2, 31)
        }
    }

    // Deactivate previous cards
    await prisma.studentIdCard.updateMany({
        where: { studentId: params.studentId, isActive: true },
        data: { isActive: false },
    })

    const card = await prisma.studentIdCard.create({
        data: {
            studentId: params.studentId,
            issuedById: session.user.id,
            validTill,
            isActive: true,
        },
    })

    await prisma.auditLog.create({
        data: {
            institutionId: session.user.institutionId,
            userId: session.user.id,
            action: 'ID_CARD_ISSUED',
            tableName: 'StudentIdCard',
            recordId: card.id,
        },
    })

    return NextResponse.json({ idCardId: card.id }, { status: 201 })
}
