import { auth } from '@/server/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { isConsumerPortal } from '@/lib/permissions'
import { ConsumerBottomNav } from '@/components/layout/ConsumerBottomNav'
import { ThemeToggle } from '@/components/theme-toggle'
import type { ReactNode } from 'react'
import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
    const session = await auth()
    if (!session) return {}

    const institution = await prisma.institution.findUnique({
        where: { id: session.user.institutionId },
        select: { faviconUrl: true },
    })

    if (!institution?.faviconUrl) return {}

    return {
        icons: {
            icon: institution.faviconUrl,
            apple: institution.faviconUrl,
        },
    }
}

export default async function ConsumerLayout({
    children,
}: {
    children: ReactNode
}): Promise<JSX.Element> {
    const session = await auth()

    if (!session) redirect('/auth/login')

    // Management users do not belong in this shell
    if (!isConsumerPortal(session.user.portalType)) {
        redirect('/dashboard')
    }

    return (
        <div className="flex flex-col min-h-screen">
            <div className="fixed top-3 right-3 z-30">
                <ThemeToggle />
            </div>
            <main className="flex-1 pb-20 p-4">
                {children}
            </main>
            <ConsumerBottomNav
                portalType={session.user.portalType}
                permissions={session.user.permissions}
            />
        </div>
    )
}
