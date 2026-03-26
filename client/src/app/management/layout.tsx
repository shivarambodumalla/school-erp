import { auth } from '@/server/auth'
import { redirect } from 'next/navigation'
import { isConsumerPortal } from '@/lib/permissions'
import { ManagementSidebar } from '@/components/layout/ManagementSidebar'
import type { ReactNode } from 'react'

export default async function ManagementLayout({
    children,
}: {
    children: ReactNode
}): Promise<JSX.Element> {
    const session = await auth()

    if (!session) redirect('/auth/login')

    // Consumer users (parent/student) do not belong in this shell
    if (isConsumerPortal(session.user.portalType)) {
        redirect('/dashboard')
    }

    return (
        <div className="flex min-h-screen">
            <ManagementSidebar
                permissions={session.user.permissions}
                institutionName={session.user.institutionName}
                userEmail={session.user.email ?? ''}
                portalType={session.user.portalType}
            />
            <main className="flex-1 md:ml-64 p-4 md:p-6">
                {children}
            </main>
        </div>
    )
}
