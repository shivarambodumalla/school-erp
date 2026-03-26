'use client'

import {
  Users, BookOpen, Ticket, ShieldCheck,
  Palette, Globe, ChevronRight, Settings,
} from 'lucide-react'

interface Props {
  institutionId: string
  subdomain: string
  isSchoolAdmin?: boolean
}

interface QuickLinkItem {
  label: string
  icon: React.ElementType
  href: string
  external?: boolean
}

export function QuickLinks({ institutionId, subdomain, isSchoolAdmin }: Props) {
  const superBase = `/super/institutions/${institutionId}`
  const schoolBase = '/management'

  const superLinks: QuickLinkItem[] = [
    { label: 'Users', icon: Users, href: `${superBase}?tab=people` },
    { label: 'Classes', icon: BookOpen, href: `${superBase}?tab=academic` },
    { label: 'Tickets', icon: Ticket, href: `${superBase}?tab=support` },
    { label: 'Masquerade', icon: ShieldCheck, href: `${superBase}#masquerade` },
    { label: 'White Label', icon: Palette, href: `${superBase}?tab=whitelabel` },
    {
      label: 'Open Site',
      icon: Globe,
      href: process.env.NODE_ENV === 'production'
        ? `https://${subdomain}.onflows.app`
        : `http://${subdomain}.localhost:3000`,
      external: true,
    },
  ]

  const schoolLinks: QuickLinkItem[] = [
    { label: 'Users', icon: Users, href: `${schoolBase}/users` },
    { label: 'Classes', icon: BookOpen, href: `${schoolBase}/institution/classes` },
    { label: 'Tickets', icon: Ticket, href: `${schoolBase}/tickets` },
    { label: 'White Label', icon: Palette, href: `${schoolBase}/settings/whitelabel` },
    { label: 'Settings', icon: Settings, href: `${schoolBase}/settings` },
  ]

  const links = isSchoolAdmin ? schoolLinks : superLinks

  return (
    <div className="rounded-xl border bg-card p-4">
      <h3 className="font-semibold text-sm mb-3">Quick Links</h3>
      <div className="grid grid-cols-2 gap-2">
        {links.map(link => {
          const Icon = link.icon
          return (
            <a
              key={link.label}
              href={link.href}
              {...(link.external
                ? { target: '_blank', rel: 'noopener noreferrer' }
                : {})}
              className="flex items-center gap-2 rounded-lg p-2.5
                text-sm text-muted-foreground
                hover:bg-muted hover:text-foreground
                transition-colors min-h-[44px]"
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="flex-1">{link.label}</span>
              <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-50" />
            </a>
          )
        })}
      </div>
    </div>
  )
}
