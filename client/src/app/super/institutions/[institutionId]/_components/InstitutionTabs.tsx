'use client'

import Link from 'next/link'
import { Tabs, TabsContent, TabsList, TabsTrigger }
  from '@/components/ui/tabs'
import {
  Users, UserCheck, ClipboardList, LayoutGrid,
  CalendarCheck, CreditCard, BookOpen, Settings,
  LayoutDashboard,
} from 'lucide-react'
import { OverviewTab } from './tabs/OverviewTab'
import { PeopleTab } from './tabs/PeopleTab'
import { AcademicTab } from './tabs/AcademicTab'
import { EngagementTab } from './tabs/EngagementTab'
import { FinanceTab } from './tabs/FinanceTab'
import { SupportTab } from './tabs/SupportTab'
import { RiskTab } from './tabs/RiskTab'
import { AuditTab } from './tabs/AuditTab'
import { WhiteLabelTab } from './tabs/WhiteLabelTab'

interface Institution {
  id: string
  name: string
  primaryColor: string
  secondaryColor: string | null
  logoUrl: string | null
  squareLogoUrl: string | null
  faviconUrl: string | null
  planTier: string
  themePalette: unknown
  themeAppliedAt: string | null
}

interface Props {
  institutionId: string
  institution: Institution
  apiBase: string
}

const MANAGE_CARDS = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '', desc: 'School overview' },
  { label: 'Students', icon: Users, path: '/students', desc: 'Manage students' },
  { label: 'Staff', icon: UserCheck, path: '/staff', desc: 'Staff directory' },
  { label: 'Admissions', icon: ClipboardList, path: '/admissions', desc: 'Pipeline' },
  { label: 'Classes', icon: LayoutGrid, path: '/institution/classes', desc: 'Structure' },
  { label: 'Attendance', icon: CalendarCheck, path: '/attendance', desc: 'Mark & review' },
  { label: 'Fees', icon: CreditCard, path: '/fees', desc: 'Collection' },
  { label: 'Courses', icon: BookOpen, path: '/courses', desc: 'LMS' },
  { label: 'Settings', icon: Settings, path: '/settings', desc: 'Configure' },
]

const TABS = [
  { value: 'manage', label: 'Manage' },
  { value: 'overview', label: 'Overview' },
  { value: 'people', label: 'People' },
  { value: 'academic', label: 'Academic' },
  { value: 'engagement', label: 'Engagement' },
  { value: 'finance', label: 'Finance' },
  { value: 'support', label: 'Support' },
  { value: 'risk', label: 'Risk' },
  { value: 'audit', label: 'Audit' },
  { value: 'whitelabel', label: 'White Label' },
]

export function InstitutionTabs({ institutionId, institution, apiBase }: Props) {
  const manageBase = `/super/institutions/${institutionId}/manage`

  return (
    <Tabs defaultValue="manage">
      <TabsList className="w-full justify-start">
        {TABS.map(tab => (
          <TabsTrigger key={tab.value} value={tab.value}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>

      <div className="mt-6">
        {/* Manage tab — primary entry point */}
        <TabsContent value="manage">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {MANAGE_CARDS.map((card) => (
              <Link
                key={card.path}
                href={`${manageBase}${card.path}`}
                className="flex flex-col gap-3 p-5 rounded-xl border
                  bg-card hover:bg-accent/50 transition-colors
                  min-h-[100px]"
              >
                <card.icon className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-semibold text-sm">{card.label}</p>
                  <p className="text-xs text-muted-foreground">{card.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="overview">
          <OverviewTab institutionId={institutionId} apiBase={apiBase} />
        </TabsContent>

        <TabsContent value="people">
          <div className="space-y-4">
            <div className="flex gap-3">
              <Link href={`${manageBase}/staff`}
                className="text-sm font-medium text-primary hover:underline">
                Manage Staff &rarr;
              </Link>
              <Link href={`${manageBase}/students`}
                className="text-sm font-medium text-primary hover:underline">
                Manage Students &rarr;
              </Link>
              <Link href={`${manageBase}/admissions`}
                className="text-sm font-medium text-primary hover:underline">
                View Pipeline &rarr;
              </Link>
            </div>
            <PeopleTab institutionId={institutionId} apiBase={apiBase} />
          </div>
        </TabsContent>

        <TabsContent value="academic">
          <div className="space-y-4">
            <Link href={`${manageBase}/institution/classes`}
              className="text-sm font-medium text-primary hover:underline">
              Manage Classes &rarr;
            </Link>
            <AcademicTab institutionId={institutionId} apiBase={apiBase} />
          </div>
        </TabsContent>

        <TabsContent value="engagement">
          <EngagementTab institutionId={institutionId} apiBase={apiBase} />
        </TabsContent>

        <TabsContent value="finance">
          <div className="space-y-4">
            <Link href={`${manageBase}/fees`}
              className="text-sm font-medium text-primary hover:underline">
              Manage Fees &rarr;
            </Link>
            <FinanceTab institutionId={institutionId} apiBase={apiBase} />
          </div>
        </TabsContent>

        <TabsContent value="support">
          <SupportTab institutionId={institutionId} apiBase={apiBase} />
        </TabsContent>

        <TabsContent value="risk">
          <RiskTab institutionId={institutionId} apiBase={apiBase} />
        </TabsContent>

        <TabsContent value="audit">
          <AuditTab institutionId={institutionId} apiBase={apiBase} />
        </TabsContent>

        <TabsContent value="whitelabel">
          <WhiteLabelTab institution={institution} />
        </TabsContent>
      </div>
    </Tabs>
  )
}
