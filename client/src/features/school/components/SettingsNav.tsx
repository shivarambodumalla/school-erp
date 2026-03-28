'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Building2, Palette, Lock, SlidersHorizontal, BookOpenCheck } from 'lucide-react'

const TABS = [
  { label: 'Institution Details', href: '/management/settings', icon: Building2 },
  { label: 'Branding & Theme', href: '/management/settings/branding', icon: Palette },
  { label: 'Admissions', href: '/management/settings/admissions', icon: SlidersHorizontal },
  { label: 'Academics', href: '/management/settings/academics', icon: BookOpenCheck },
  { label: 'Change Password', href: '/management/settings/password', icon: Lock },
]

export function SettingsNav() {
  const pathname = usePathname()

  return (
    <div className="flex gap-1 border-b">
      {TABS.map(tab => {
        const isActive = pathname === tab.href
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium
              border-b-2 transition-colors min-h-[44px]
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
  )
}