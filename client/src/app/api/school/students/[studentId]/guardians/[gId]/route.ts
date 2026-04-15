import { NextRequest, NextResponse } from 'next/server'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import {
  checkGuardianNotOnly,
  cascadeGuardianLoginRemoval,
  DependencyError,
  handleDependencyError,
} from '@/lib/dependency-checks'

type Params = { params: { studentId: string; gId: string } }

export async function PATCH(req: NextRequest, { params }: Params) {
    const ctx = await getSchoolContext(req, ['ADMIN'])
    if (isApiError(ctx)) return ctx
    const { institutionId } = ctx

    const student = await prisma.student.findFirst({
        where: { id: params.studentId, institutionId: institutionId },
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
                const { generateTempPassword } = await import('@/lib/generate-password')
                const hashed = await bcrypt.hash(generateTempPassword(), 10)
                const user = await prisma.user.create({
                    data: {
                        institutionId: institutionId,
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

export async function DELETE(req: NextRequest, { params }: Params) {
    const ctx = await getSchoolContext(req, ['ADMIN'])
    if (isApiError(ctx)) return ctx
    const { institutionId } = ctx

    const student = await prisma.student.findFirst({
        where: { id: params.studentId, institutionId },
        select: { id: true },
    })
    if (!student) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const guardian = await prisma.guardian.findFirst({
        where: { id: params.gId, studentId: params.studentId },
    })
    if (!guardian) return NextResponse.json({ error: 'Guardian not found' }, { status: 404 })

    try {
        // Block removal if this is the only guardian
        await checkGuardianNotOnly(params.studentId)
    } catch (err: unknown) {
        if (err instanceof DependencyError) return handleDependencyError(err)
        throw err
    }

    // Cascade login removal if guardian has canLogin enabled
    if (guardian.canLogin) {
        await cascadeGuardianLoginRemoval(guardian.id)
    } else if (guardian.userId) {
        await prisma.user.update({
            where: { id: guardian.userId },
            data: { isActive: false },
        })
    }

    await prisma.guardian.delete({ where: { id: params.gId } })

    return NextResponse.json({ success: true })
}
