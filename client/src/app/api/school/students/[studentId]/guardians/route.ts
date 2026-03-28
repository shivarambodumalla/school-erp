import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/server/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

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

    const guardians = await prisma.guardian.findMany({
        where: { studentId: params.studentId },
    })

    return NextResponse.json(guardians)
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
        select: { id: true },
    })
    if (!student) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const body = await req.json()

    // Enforce max 1 FATHER, max 1 MOTHER
    if (body.type === 'FATHER' || body.type === 'MOTHER') {
        const existing = await prisma.guardian.findFirst({
            where: { studentId: params.studentId, type: body.type },
        })
        if (existing) {
            return NextResponse.json(
                { error: `A ${body.type.toLowerCase()} is already registered` },
                { status: 409 },
            )
        }
    }

    let userId: string | undefined
    if (body.canLogin && body.email) {
        const hashed = await bcrypt.hash('Welcome@123', 10)
        const user = await prisma.user.create({
            data: {
                institutionId: session.user.institutionId,
                email: body.email,
                hashedPassword: hashed,
                portalType: 'PARENT',
            },
        })
        userId = user.id
    }

    const guardian = await prisma.guardian.create({
        data: {
            studentId: params.studentId,
            type: body.type,
            relationship: body.relationship ?? null,
            name: body.name,
            phone: body.phone,
            alternatePhone: body.alternatePhone ?? null,
            email: body.email ?? null,
            occupation: body.occupation ?? null,
            annualIncome: body.annualIncome ?? null,
            isPrimaryContact: body.isPrimaryContact ?? false,
            isEmergencyContact: body.isEmergencyContact ?? false,
            canLogin: body.canLogin ?? false,
            userId: userId ?? null,
        },
    })

    return NextResponse.json(guardian, { status: 201 })
}
