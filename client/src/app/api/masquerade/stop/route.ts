import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/server/auth'
import { prisma } from '@/lib/prisma'
import {
    MASQUERADE_COOKIE,
    MASQUERADE_MODE_COOKIE,
    MASQUERADE_INITIATOR_COOKIE,
} from '@/lib/masquerade'

export async function POST(req: NextRequest) {
    try {
        const session = await auth()
        if (!session) {
            return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
        }

        const targetUserId = req.cookies.get(MASQUERADE_COOKIE)?.value

        // Audit log — stop
        if (targetUserId) {
            const targetUser = await prisma.user.findUnique({
                where: { id: targetUserId },
                select: { email: true, portalType: true },
            })

            await prisma.auditLog.create({
                data: {
                    institutionId: session.user.institutionId,
                    userId: session.user.id,
                    action: 'MASQUERADE_STOP',
                    tableName: 'User',
                    recordId: targetUserId,
                    after: {
                        targetEmail: targetUser?.email,
                        targetPortalType: targetUser?.portalType,
                        initiatorEmail: session.user.email,
                    },
                },
            })
        }

        // Clear all masquerade cookies
        const res = NextResponse.json({ success: true })
        res.cookies.delete(MASQUERADE_COOKIE)
        res.cookies.delete(MASQUERADE_MODE_COOKIE)
        res.cookies.delete(MASQUERADE_INITIATOR_COOKIE)

        return res
    } catch (err) {
        console.error('masquerade stop error:', err)
        return NextResponse.json(
            { error: 'Something went wrong' },
            { status: 500 },
        )
    }
}
