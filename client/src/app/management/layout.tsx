import { auth } from '@/server/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { isConsumerPortal } from '@/lib/permissions'
import { ManagementSidebar } from '@/components/layout/ManagementSidebar'
import { ThemeInjector } from '@/components/shared/ThemeInjector'
import { AcademicYearProvider } from '@/lib/academic-year-context'
import type { ReactNode } from 'react'
import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
    const session = await auth()
    if (!session) return {}

    const institution = await prisma.institution.findUnique({
        where: { id: session.user.institutionId },
        select: { faviconUrl: true, name: true },
    })

    return {
        ...(institution?.name ? { title: { default: institution.name, template: `%s | ${institution.name}` } } : {}),
        ...(institution?.faviconUrl ? {
            icons: {
                icon: institution.faviconUrl,
                apple: institution.faviconUrl,
            },
        } : {}),
    }
}

export default async function ManagementLayout({
    children,
}: {
    children: ReactNode
}): Promise<JSX.Element> {
    const session = await auth()

    if (!session) redirect('/auth/login')

    if (isConsumerPortal(session.user.portalType)) {
        redirect('/dashboard')
    }

    // Fetch latest theme colors from DB (not stale JWT)
    const institution = await prisma.institution.findUnique({
        where: { id: session.user.institutionId },
        select: {
            primaryColor: true,
            secondaryColor: true,
            logoUrl: true,
        },
    })

    return (
        <AcademicYearProvider>
            <div className="flex h-screen overflow-hidden">
                <ThemeInjector
                    primaryColor={institution?.primaryColor ?? '#3730A3'}
                    secondaryColor={institution?.secondaryColor}
                />
                <ManagementSidebar
                    permissions={session.user.permissions}
                    institutionName={session.user.institutionName}
                    userEmail={session.user.email ?? ''}
                    portalType={session.user.portalType}
                    logoUrl={institution?.logoUrl}
                />
                <main className="flex-1 md:ml-64 px-4 pb-4 pt-16 md:pt-6 md:px-6 md:pb-6 overflow-auto">
                    {children}
                </main>
            </div>
        </AcademicYearProvider>
    )
}