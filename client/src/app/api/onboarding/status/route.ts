import { auth } from '@/server/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
    const session = await auth()
    if (!session) return NextResponse.json({ isComplete: true })

    const onboarding = await prisma.onboardingStep.findUnique({
        where: { institutionId: session.user.institutionId },
        select: { completedAt: true },
    })

    return NextResponse.json({ isComplete: onboarding?.completedAt != null })
}
