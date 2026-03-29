import { NextRequest, NextResponse } from 'next/server'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'
import { documentTypeUpdateSchema } from '@/features/settings/schemas/admissionSettingsSchema'

export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string } },
) {
    const ctx = await getSchoolContext(req, ['ADMIN'])
    if (isApiError(ctx)) return ctx
    const { institutionId } = ctx

    const body = await req.json()
    const parsed = documentTypeUpdateSchema.safeParse(body)
    if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const config = await prisma.documentTypeConfig.findFirst({
        where: { id: params.id, institutionId: institutionId },
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
    req: NextRequest,
    { params }: { params: { id: string } },
) {
    const ctx = await getSchoolContext(req, ['ADMIN'])
    if (isApiError(ctx)) return ctx
    const { institutionId } = ctx

    const config = await prisma.documentTypeConfig.findFirst({
        where: { id: params.id, institutionId: institutionId },
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
