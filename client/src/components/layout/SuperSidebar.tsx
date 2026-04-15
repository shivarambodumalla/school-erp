/* eslint-disable @next/next/no-img-element */
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
  LayoutDashboard,
  Building2,
  BarChart3,
  Settings,
  LogOut,
  Ticket,
  ShieldCheck,
  Users,
  Menu,
  Sparkles,
} from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'

const NAV = [
  { label: 'Dashboard', path: '/super/dashboard', icon: LayoutDashboard },
  { label: 'Institutions', path: '/super/institutions', icon: Building2 },
  { label: 'Marketing Leads', path: '/super/marketing-leads', icon: Sparkles },
  { label: 'Platform Users', path: '/super/users', icon: Users },
  { label: 'Support Tickets', path: '/super/tickets', icon: Ticket },
  { label: 'Analytics', path: '/super/analytics', icon: BarChart3 },
  { label: 'Platform Roles', path: '/super/roles', icon: ShieldCheck },
  { label: 'Settings', path: '/super/settings', icon: Settings },
]

export function SuperSidebar({ userEmail }: { userEmail: string }) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const navContent = (
    <>
      <div className="p-4 border-b space-y-2.5">
        <img src="/images/logo-wide.svg" alt="Onflows" className="h-6" />
        <p className="text-xs text-muted-foreground truncate">Onflows · Super Admin</p>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
        {NAV.map((item) => {
          const isActive = pathname.startsWith(item.path)
          return (
            <Link
              key={item.path}
              href={item.path}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm
                                transition-colors min-h-[44px] ${
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
        <div className="flex items-center gap-1">
          <button
            onClick={() => signOut({ callbackUrl: '/auth/login' })}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm
                            text-muted-foreground hover:text-foreground hover:bg-muted
                            flex-1 transition-colors min-h-[44px]"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
          <ThemeToggle />
        </div>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile header bar */}
      <div
        className="md:hidden fixed top-0 left-0 right-0 z-20 h-14 border-b bg-background
                flex items-center gap-3 px-4"
      >
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="flex items-center justify-center h-10 w-10 rounded-lg
                        hover:bg-muted transition-colors -ml-1"
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex-1 min-w-0">
          <img src="/images/logo-wide.svg" alt="Onflows" className="h-5" />
        </div>
        <ThemeToggle />
      </div>

      {/* Mobile Sheet drawer */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="p-0 w-[280px] sm:max-w-[280px] flex flex-col">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          {navContent}
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 h-full w-64 border-r bg-background z-30">
        {navContent}
      </aside>
    </>
  )
}
