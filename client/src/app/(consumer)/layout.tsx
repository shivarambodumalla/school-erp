import { auth } from '@/server/auth'
import { redirect } from 'next/navigation'
import { isConsumerPortal } from '@/lib/permissions'
import { ConsumerBottomNav } from '@/components/layout/ConsumerBottomNav'
import { TopBar } from '@/components/layout/TopBar'
import type { ReactNode } from 'react'

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
            <TopBar title="" />
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
