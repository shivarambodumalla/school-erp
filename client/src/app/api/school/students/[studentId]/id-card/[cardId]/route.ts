import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/server/auth'
import { prisma } from '@/lib/prisma'

export async function DELETE(
    _req: NextRequest,
    { params }: { params: { studentId: string; cardId: string } },
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

    await prisma.studentIdCard.update({
        where: { id: params.cardId },
        data: { isActive: false },
    })

    return NextResponse.json({ success: true })
}
