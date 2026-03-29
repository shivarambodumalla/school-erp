import { NextRequest, NextResponse } from 'next/server'
import { getSchoolContext, isApiError } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'

export async function DELETE(
    req: NextRequest,
    { params }: { params: { studentId: string; cardId: string } },
) {
    const ctx = await getSchoolContext(req, ['ADMIN'])
    if (isApiError(ctx)) return ctx
    const { institutionId } = ctx

    const student = await prisma.student.findFirst({
        where: { id: params.studentId, institutionId: institutionId },
        select: { id: true },
    })
    if (!student) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    await prisma.studentIdCard.update({
        where: { id: params.cardId },
        data: { isActive: false },
    })

    return NextResponse.json({ success: true })
}
