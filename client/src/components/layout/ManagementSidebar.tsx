'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { signOut } from 'next-auth/react'
import { ThemeToggle } from '@/components/theme-toggle'
import {
    MANAGEMENT_NAV,
    getAuthorisedNav,
} from '@/lib/nav'
import type { Permission } from '@/lib/permissions'

interface ManagementSidebarProps {
    permissions: Permission[]
    institutionName: string
    userEmail: string
    portalType: string
    logoUrl?: string | null
    isSuperAdminManaging?: boolean
    managingInstitutionId?: string
}

export function ManagementSidebar({
    permissions,
    institutionName,
    userEmail,
    portalType,
    logoUrl,
    isSuperAdminManaging = false,
    managingInstitutionId,
}: ManagementSidebarProps): JSX.Element {
    const pathname = usePathname()
    const authorisedNav = getAuthorisedNav(MANAGEMENT_NAV, permissions)

    const manageBase = isSuperAdminManaging && managingInstitutionId
        ? `/super/institutions/${managingInstitutionId}/manage`
        : ''

    function resolvePath(path: string): string {
        if (!manageBase) return path
        // /management/dashboard -> /super/institutions/[id]/manage
        // /management/students -> /super/institutions/[id]/manage/students
        const suffix = path.replace('/management', '')
        if (suffix === '/dashboard') return manageBase
        return manageBase + suffix
    }

    return (
        <aside className={`hidden md:flex flex-col fixed left-0 h-full w-64 border-r bg-background z-30
            ${isSuperAdminManaging ? 'top-12 border-l-4 border-l-amber-500' : 'top-0'}`}>
            {/* Logo + School name + role */}
            <div className="p-4 border-b space-y-2.5">
                {logoUrl ? (
                    <img src={logoUrl} alt={institutionName} className="h-6 max-w-[140px] object-contain" />
                ) : (
                    <img src="/images/logo-wide.svg" alt="Onflows" className="h-6" />
                )}
                <p className="text-xs text-muted-foreground truncate">
                    {institutionName} · {isSuperAdminManaging ? 'SUPER ADMIN' : portalType.replace('_', ' ')}
                </p>
            </div>

            {/* Nav groups */}
            <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-3">
                {authorisedNav.map((group) => (
                    <div key={group.label}>
                        <p className="text-xs font-semibold uppercase tracking-wider
                            text-muted-foreground px-3 mb-1 mt-2">
                            {group.label}
                        </p>
                        <div className="space-y-0.5">
                            {group.items.map((item) => {
                                const href = resolvePath(item.path)
                                const isActive = pathname === href ||
                                    (href !== resolvePath('/management/dashboard') && pathname.startsWith(href))
                                return (
                                    <Link
                                        key={item.path}
                                        href={href}
                                        className={`flex items-center gap-2.5 px-3 py-2 rounded-lg
                                            text-sm transition-colors min-h-[44px]
                                            ${isActive
                                                ? 'bg-primary text-primary-foreground font-medium'
                                                : 'text-foreground hover:bg-muted'
                                            }`}
                                    >
                                        <item.icon className="h-4 w-4 shrink-0" />
                                        {item.label}
                                    </Link>
                                )
                            })}
                        </div>
                    </div>
                ))}
            </nav>

            {/* Bottom section */}
            <div className="p-3 border-t">
                {isSuperAdminManaging ? (
                    <>
                        <p className="text-xs text-muted-foreground truncate px-3 mb-1">
                            Managing {institutionName}
                        </p>
                        <Link
                            href={`/super/institutions/${managingInstitutionId}`}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm
                                text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950
                                flex-1 transition-colors min-h-[44px] font-medium"
                        >
                            <LogOut className="h-4 w-4" />
                            Exit to Platform
                        </Link>
                    </>
                ) : (
                    <>
                        <p className="text-xs text-muted-foreground truncate px-3 mb-1">
                            {userEmail}
                        </p>
                        <div className="flex items-center gap-1">
                            <button
                                type="button"
                                onClick={(): void => { signOut({ callbackUrl: '/auth/login' }) }}
                                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm
                                    text-muted-foreground hover:text-foreground hover:bg-muted
                                    flex-1 transition-colors min-h-[44px]"
                            >
                                <LogOut className="h-4 w-4" />
                                Sign out
                            </button>
                            <ThemeToggle />
                        </div>
                    </>
                )}
            </div>
        </aside>
    )
}
