import { NextResponse } from 'next/server'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'
import { documentTypeSchema } from '@/features/settings/schemas/admissionSettingsSchema'

export async function GET(req: Request) {
    const ctx = await getSchoolContext(req, ['ADMIN'])
    if (isApiError(ctx)) return ctx
    const { institutionId } = ctx

    const docs = await prisma.documentTypeConfig.findMany({
        where: { institutionId: institutionId },
        orderBy: { order: 'asc' },
    })

    return NextResponse.json(docs)
}

export async function POST(req: Request) {
    const ctx = await getSchoolContext(req, ['ADMIN'])
    if (isApiError(ctx)) return ctx
    const { institutionId } = ctx

    const body = await req.json()
    const parsed = documentTypeSchema.safeParse(body)
    if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }


    const existing = await prisma.documentTypeConfig.findUnique({
        where: { institutionId_name: { institutionId, name: parsed.data.name } },
    })
    if (existing) {
        return NextResponse.json(
            { error: `"${parsed.data.name}" already exists` },
            { status: 409 },
        )
    }

    const maxOrder = await prisma.documentTypeConfig.aggregate({
        where: { institutionId },
        _max: { order: true },
    })

    const doc = await prisma.documentTypeConfig.create({
        data: {
            institutionId,
            ...parsed.data,
            order: (maxOrder._max.order ?? -1) + 1,
        },
    })

    return NextResponse.json(doc, { status: 201 })
}
