'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Building2, Palette, Lock, SlidersHorizontal,
  BookOpenCheck, Users, CreditCard, Bell,
} from 'lucide-react'

const TABS = [
  { label: 'Institution', href: '/management/settings', icon: Building2, exact: true },
  { label: 'Branding', href: '/management/settings/branding', icon: Palette },
  { label: 'Admissions', href: '/management/settings/admissions', icon: SlidersHorizontal },
  { label: 'Academics', href: '/management/settings/academics', icon: BookOpenCheck },
  { label: 'Staff', href: '/management/settings/staff', icon: Users },
  { label: 'Fees', href: '/management/settings/fees', icon: CreditCard },
  { label: 'Notifications', href: '/management/settings/notifications', icon: Bell },
  { label: 'Password', href: '/management/settings/password', icon: Lock },
]

export function SettingsNav() {
  const pathname = usePathname()

  return (
    <div className="overflow-x-auto scrollbar-none -mx-4 md:-mx-6 px-4 md:px-6">
      <div className="flex gap-1 border-b min-w-max">
        {TABS.map(tab => {
          const isActive = tab.exact
            ? pathname === tab.href
            : pathname.startsWith(tab.href)
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex items-center gap-2 px-3 py-2.5 text-sm font-medium
                border-b-2 transition-colors min-h-[44px] whitespace-nowrap shrink-0
                ${isActive
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
