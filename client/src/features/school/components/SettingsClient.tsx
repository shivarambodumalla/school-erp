'use client'

import { useState } from 'react'
import { Building2, Palette, Lock } from 'lucide-react'
import { WhiteLabelTab } from
  '@/app/super/institutions/[institutionId]/_components/tabs/WhiteLabelTab'
import { InstitutionDetailsTab } from './InstitutionDetailsTab'
import { ChangePasswordTab } from './ChangePasswordTab'

interface Institution {
  id: string
  name: string
  subdomain: string
  board: string
  institutionType: string
  planTier: string
  primaryColor: string
  secondaryColor: string | null
  logoUrl: string | null
  themePalette: unknown
  themeAppliedAt: string | null
  phone: string | null
  website: string | null
  addressLine1: string | null
  addressLine2: string | null
  city: string | null
  state: string | null
  pinCode: string | null
  establishedYear: number | null
  studentCapacity: number | null
}

interface Props {
  institution: Institution
}

const TABS = [
  { id: 'details', label: 'Institution Details', icon: Building2 },
  { id: 'branding', label: 'Branding & Theme', icon: Palette },
  { id: 'password', label: 'Change Password', icon: Lock },
] as const

type TabId = (typeof TABS)[number]['id']

export function SettingsClient({ institution }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>('details')

  return (
    <div className="space-y-6">
      {/* Tab bar */}
      <div className="flex gap-1 border-b">
        {TABS.map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium
              border-b-2 transition-colors min-h-[44px]
              ${activeTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'details' && (
        <InstitutionDetailsTab institution={institution} />
      )}
      {activeTab === 'branding' && (
        <WhiteLabelTab institution={institution} />
      )}
      {activeTab === 'password' && (
        <ChangePasswordTab />
      )}
    </div>
  )
}