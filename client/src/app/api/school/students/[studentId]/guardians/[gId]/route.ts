import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/server/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

type Params = { params: { studentId: string; gId: string } }

export async function PATCH(req: NextRequest, { params }: Params) {
    const session = await auth()
    if (!session || session.user.portalType !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }

    const student = await prisma.student.findFirst({
        where: { id: params.studentId, institutionId: session.user.institutionId },
        select: { id: true },
    })
    if (!student) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const guardian = await prisma.guardian.findFirst({
        where: { id: params.gId, studentId: params.studentId },
    })
    if (!guardian) return NextResponse.json({ error: 'Guardian not found' }, { status: 404 })

    const body = await req.json()
    const data: Record<string, unknown> = {}
    const fields = [
        'type', 'relationship', 'name', 'phone', 'alternatePhone',
        'email', 'occupation', 'annualIncome',
        'isPrimaryContact', 'isEmergencyContact', 'canLogin',
    ]
    for (const f of fields) {
        if (f in body) data[f] = body[f]
    }

    // Handle canLogin toggle
    if ('canLogin' in body) {
        if (body.canLogin && !guardian.canLogin) {
            // Create parent User account
            const email = body.email ?? guardian.email
            if (email) {
                const hashed = await bcrypt.hash('Welcome@123', 10)
                const user = await prisma.user.create({
                    data: {
                        institutionId: session.user.institutionId,
                        email,
                        hashedPassword: hashed,
                        portalType: 'PARENT',
                    },
                })
                data.userId = user.id
            }
        } else if (!body.canLogin && guardian.canLogin && guardian.userId) {
            await prisma.user.update({
                where: { id: guardian.userId },
                data: { isActive: false },
            })
            data.userId = null
        }
    }

    const updated = await prisma.guardian.update({
        where: { id: params.gId },
        data,
    })

    return NextResponse.json(updated)
}

export async function DELETE(_req: NextRequest, { params }: Params) {
    const session = await auth()
    if (!session || session.user.portalType !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }

    const student = await prisma.student.findFirst({
        where: { id: params.studentId, institutionId: session.user.institutionId },
        select: { id: true },
    })
    if (!student) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const guardian = await prisma.guardian.findFirst({
        where: { id: params.gId, studentId: params.studentId },
    })
    if (!guardian) return NextResponse.json({ error: 'Guardian not found' }, { status: 404 })

    if (guardian.userId) {
        await prisma.user.update({
            where: { id: guardian.userId },
            data: { isActive: false },
        })
    }

    await prisma.guardian.delete({ where: { id: params.gId } })

    return NextResponse.json({ success: true })
}
