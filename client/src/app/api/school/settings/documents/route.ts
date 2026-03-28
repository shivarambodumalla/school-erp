import { NextResponse } from 'next/server'
import { auth } from '@/server/auth'
import { prisma } from '@/lib/prisma'
import { documentTypeSchema } from '@/features/settings/schemas/admissionSettingsSchema'

export async function GET() {
    const session = await auth()
    if (!session || session.user.portalType !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }

    const docs = await prisma.documentTypeConfig.findMany({
        where: { institutionId: session.user.institutionId },
        orderBy: { order: 'asc' },
    })

    return NextResponse.json(docs)
}

export async function POST(req: Request) {
    const session = await auth()
    if (!session || session.user.portalType !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }

    const body = await req.json()
    const parsed = documentTypeSchema.safeParse(body)
    if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const institutionId = session.user.institutionId

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
