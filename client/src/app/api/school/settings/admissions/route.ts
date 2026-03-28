import { NextResponse } from 'next/server'
import { auth } from '@/server/auth'
import { prisma } from '@/lib/prisma'
import { numberFormatsSchema, idProofTypesSchema } from '@/features/settings/schemas/admissionSettingsSchema'

export async function GET() {
    const session = await auth()
    if (!session || session.user.portalType !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }

    const institutionId = session.user.institutionId

    const settings = await prisma.admissionSettings.upsert({
        where: { institutionId },
        create: { institutionId },
        update: {},
    })

    return NextResponse.json(settings)
}

export async function PATCH(req: Request) {
    const session = await auth()
    if (!session || session.user.portalType !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }

    const institutionId = session.user.institutionId
    const body = await req.json()

    // Validate depending on which section is being updated
    const numbersParse = numberFormatsSchema.safeParse(body)
    const idProofParse = idProofTypesSchema.safeParse(body)

    if (!numbersParse.success && !idProofParse.success) {
        return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
    }

    const data = numbersParse.success ? numbersParse.data : idProofParse.data!

    const updated = await prisma.admissionSettings.update({
        where: { institutionId },
        data,
    })

    return NextResponse.json(updated)
}
