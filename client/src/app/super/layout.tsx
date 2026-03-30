import { auth } from '@/server/auth'
import { redirect } from 'next/navigation'
import { SuperSidebar } from '@/components/layout/SuperSidebar'
import type { ReactNode } from 'react'

export default async function SuperLayout({ children }: { children: ReactNode }) {
    const session = await auth()
    if (!session) redirect('/auth/login')
    if (session.user.portalType !== 'SUPER_ADMIN') redirect('/dashboard')

    return (
        <div className="flex min-h-screen bg-background">
            <SuperSidebar userEmail={session.user.email ?? ''} />
            <div className="flex flex-col flex-1 md:ml-64">
                <main className="flex-1 px-4 pb-4 pt-16 md:pt-6 md:px-6 md:pb-6">{children}</main>
            </div>
        </div>
    )
}
