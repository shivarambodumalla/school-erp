'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    PARENT_TABS,
    STUDENT_TABS,
} from '@/lib/nav'
import type { Permission } from '@/lib/permissions'

interface ConsumerBottomNavProps {
    portalType: string
    permissions: Permission[]
}

export function ConsumerBottomNav({ portalType, permissions }: ConsumerBottomNavProps): JSX.Element {
    const pathname = usePathname()
    const tabs = portalType === 'PARENT' ? PARENT_TABS : STUDENT_TABS

    // Filter tabs by permission
    const authorisedTabs = tabs.filter(
        tab => tab.permission === null || permissions.includes(tab.permission)
    )

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-30 border-t bg-background flex pb-safe">
            {authorisedTabs.map((tab) => {
                const isActive = pathname === tab.path
                return (
                    <Link
                        key={tab.path}
                        href={tab.path}
                        className={`flex flex-col items-center justify-center flex-1
              min-h-[56px] gap-1 text-xs transition-colors
              ${isActive
                                ? 'text-primary font-medium'
                                : 'text-muted-foreground'
                            }`}
                    >
                        <tab.icon className="h-5 w-5" />
                        {tab.label}
                    </Link>
                )
            })}
        </nav>
    )
}
