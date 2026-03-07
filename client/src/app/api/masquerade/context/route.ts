import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/server/auth'
import { prisma } from '@/lib/prisma'
import {
    MASQUERADE_COOKIE,
    MASQUERADE_MODE_COOKIE,
} from '@/lib/masquerade'

export async function GET(req: NextRequest) {
    const session = await auth()
    if (!session) {
        return NextResponse.json({ active: false })
    }

    const targetUserId = req.cookies.get(MASQUERADE_COOKIE)?.value
    const mode = req.cookies.get(MASQUERADE_MODE_COOKIE)?.value

    if (!targetUserId) {
        return NextResponse.json({ active: false })
    }

    const targetUser = await prisma.user.findUnique({
        where: { id: targetUserId },
        include: { institution: true },
    })

    if (!targetUser) {
        return NextResponse.json({ active: false })
    }

    return NextResponse.json({
        active: true,
        mode: mode ?? 'READ_ONLY',
        targetUser: {
            id: targetUser.id,
            email: targetUser.email,
            portalType: targetUser.portalType,
            institutionName: targetUser.institution.name,
        },
    })
}
