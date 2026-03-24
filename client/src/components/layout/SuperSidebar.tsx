'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
    LayoutDashboard, Building2,
    BarChart3, Settings, LogOut, Ticket,
    ShieldCheck, Users,
} from 'lucide-react'

const NAV = [
    { label: 'Dashboard', path: '/super/dashboard', icon: LayoutDashboard },
    { label: 'Institutions', path: '/super/institutions', icon: Building2 },
    { label: 'Platform Users', path: '/super/users', icon: Users },
    { label: 'Support Tickets', path: '/super/tickets', icon: Ticket },
    { label: 'Analytics', path: '/super/analytics', icon: BarChart3 },
    { label: 'Platform Roles', path: '/super/roles', icon: ShieldCheck },
    { label: 'Settings', path: '/super/settings', icon: Settings },
]

export function SuperSidebar({ userEmail }: { userEmail: string }) {
    const pathname = usePathname()

    return (
        <aside className="hidden md:flex flex-col fixed left-0 top-0 h-full w-64 border-r bg-background z-30">
            <div className="p-4 border-b">
                <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
                        <ShieldCheck className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <div>
                        <p className="text-sm font-bold leading-none">Platform</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Super Admin</p>
                    </div>
                </div>
            </div>

            <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
                {NAV.map((item) => {
                    const isActive = pathname.startsWith(item.path)
                    return (
                        <Link
                            key={item.path}
                            href={item.path}
                            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                                isActive
                                    ? 'bg-primary text-primary-foreground font-medium'
                                    : 'text-foreground hover:bg-muted'
                            }`}
                        >
                            <item.icon className="h-4 w-4 shrink-0" />
                            {item.label}
                        </Link>
                    )
                })}
            </nav>

            <div className="p-3 border-t space-y-1">
                <p className="text-xs text-muted-foreground truncate px-3 mb-1">{userEmail}</p>
                <button
                    onClick={() => signOut({ callbackUrl: '/auth/login' })}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted w-full transition-colors"
                >
                    <LogOut className="h-4 w-4" />
                    Sign out
                </button>
            </div>
        </aside>
    )
}
