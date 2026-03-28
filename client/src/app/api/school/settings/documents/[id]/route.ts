import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/server/auth'
import { prisma } from '@/lib/prisma'
import { documentTypeUpdateSchema } from '@/features/settings/schemas/admissionSettingsSchema'

export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string } },
) {
    const session = await auth()
    if (!session || session.user.portalType !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }

    const body = await req.json()
    const parsed = documentTypeUpdateSchema.safeParse(body)
    if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const config = await prisma.documentTypeConfig.findFirst({
        where: { id: params.id, institutionId: session.user.institutionId },
    })
    if (!config) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const updated = await prisma.documentTypeConfig.update({
        where: { id: params.id },
        data: parsed.data,
    })

    return NextResponse.json(updated)
}

export async function DELETE(
    _req: NextRequest,
    { params }: { params: { id: string } },
) {
    const session = await auth()
    if (!session || session.user.portalType !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }

    const config = await prisma.documentTypeConfig.findFirst({
        where: { id: params.id, institutionId: session.user.institutionId },
    })
    if (!config) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const docCount = await prisma.studentDocument.count({
        where: { documentTypeConfigId: params.id },
    })
    if (docCount > 0) {
        return NextResponse.json(
            { error: `${docCount} documents uploaded against this type. Cannot delete.` },
            { status: 400 },
        )
    }

    await prisma.documentTypeConfig.delete({ where: { id: params.id } })

    return NextResponse.json({ success: true })
}
