import { NextResponse } from 'next/server'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'
import { numberFormatsSchema, idProofTypesSchema } from '@/features/settings/schemas/admissionSettingsSchema'

export async function GET(req: Request) {
    const ctx = await getSchoolContext(req, ['ADMIN'])
    if (isApiError(ctx)) return ctx
    const { institutionId } = ctx

    const settings = await prisma.admissionSettings.upsert({
        where: { institutionId },
        create: { institutionId },
        update: {},
    })

    return NextResponse.json(settings)
}

export async function PATCH(req: Request) {
    const ctx = await getSchoolContext(req, ['ADMIN'])
    if (isApiError(ctx)) return ctx
    const { institutionId } = ctx
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
