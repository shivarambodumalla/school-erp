'use client'

import { ThemeToggle } from '@/components/theme-toggle'
import { NotificationBell } from './NotificationBell'

interface TopBarProps {
    title: string
}

export function TopBar({ title }: TopBarProps): JSX.Element {
    return (
        <header className="border-b min-h-[56px] flex items-center px-4 justify-between sticky top-0 bg-background z-20">
            <p className="text-sm font-semibold">{title || 'School ERP'}</p>
            <div className="flex items-center gap-1">
                <NotificationBell />
                <ThemeToggle />
            </div>
        </header>
    )
}
