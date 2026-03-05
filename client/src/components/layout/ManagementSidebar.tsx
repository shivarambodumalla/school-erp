'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { signOut } from 'next-auth/react'
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
}

export function ManagementSidebar({
    permissions,
    institutionName,
    userEmail,
    portalType,
}: ManagementSidebarProps): JSX.Element {
    const pathname = usePathname()
    const authorisedNav = getAuthorisedNav(MANAGEMENT_NAV, permissions)

    return (
        <aside className="hidden md:flex flex-col fixed left-0 top-0 h-full w-64 border-r bg-background z-30">
            {/* School name */}
            <div className="p-4 border-b">
                <p className="font-semibold text-sm truncate">{institutionName}</p>
                <p className="text-xs text-muted-foreground">{portalType}</p>
            </div>

            {/* Nav groups */}
            <nav className="flex-1 overflow-y-auto p-3 space-y-4">
                {authorisedNav.map((group) => (
                    <div key={group.label}>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-2 mb-1">
                            {group.label}
                        </p>
                        <div className="space-y-0.5">
                            {group.items.map((item) => {
                                const isActive = pathname === item.path
                                return (
                                    <Link
                                        key={item.path}
                                        href={item.path}
                                        className={`flex items-center gap-2.5 px-2 py-2 rounded-md
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

            {/* User + logout */}
            <div className="p-3 border-t">
                <p className="text-xs text-muted-foreground truncate px-2 mb-1">
                    {userEmail}
                </p>
                <button
                    type="button"
                    onClick={(): void => { signOut({ callbackUrl: '/auth/login' }) }}
                    className="flex items-center gap-2 px-2 py-2 rounded-md text-sm
            text-muted-foreground hover:text-foreground hover:bg-muted
            w-full transition-colors min-h-[44px]"
                >
                    <LogOut className="h-4 w-4" />
                    Sign out
                </button>
            </div>
        </aside>
    )
}
