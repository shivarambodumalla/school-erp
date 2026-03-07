import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/server/auth'
import { prisma } from '@/lib/prisma'
import {
    canMasqueradeAs,
    DEFAULT_MASQUERADE_MODE,
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

        const { userId } = (await req.json()) as { userId: string }
        if (!userId) {
            return NextResponse.json({ error: 'userId required' }, { status: 400 })
        }

        // Fetch target user
        const targetUser = await prisma.user.findUnique({
            where: { id: userId },
            include: { institution: true },
        })

        if (!targetUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // Enforce hierarchy
        if (!canMasqueradeAs(session.user.portalType, targetUser.portalType)) {
            return NextResponse.json(
                { error: 'You cannot masquerade as this user' },
                { status: 403 },
            )
        }

        // Determine mode
        const mode = DEFAULT_MASQUERADE_MODE[session.user.portalType] ?? 'READ_ONLY'

        // Audit log — start
        await prisma.auditLog.create({
            data: {
                institutionId: session.user.institutionId,
                userId: session.user.id,
                action: 'MASQUERADE_START',
                tableName: 'User',
                recordId: targetUser.id,
                after: {
                    targetEmail: targetUser.email,
                    targetPortalType: targetUser.portalType,
                    mode,
                    initiatorEmail: session.user.email,
                },
            },
        })

        // Set cookies
        const res = NextResponse.json({ success: true, mode })
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax' as const,
            maxAge: 60 * 60, // 1 hour
            path: '/',
        }

        res.cookies.set(MASQUERADE_COOKIE, targetUser.id, cookieOptions)
        res.cookies.set(MASQUERADE_MODE_COOKIE, mode, cookieOptions)
        res.cookies.set(MASQUERADE_INITIATOR_COOKIE, session.user.id, cookieOptions)

        return res
    } catch (err) {
        console.error('masquerade start error:', err)
        return NextResponse.json(
            { error: 'Something went wrong' },
            { status: 500 },
        )
    }
}
