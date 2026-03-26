'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger }
  from '@/components/ui/tabs'
import { OverviewTab } from
  '@/app/super/institutions/[institutionId]/_components/tabs/OverviewTab'
import { PeopleTab } from
  '@/app/super/institutions/[institutionId]/_components/tabs/PeopleTab'
import { AcademicTab } from
  '@/app/super/institutions/[institutionId]/_components/tabs/AcademicTab'
import { EngagementTab } from
  '@/app/super/institutions/[institutionId]/_components/tabs/EngagementTab'
import { FinanceTab } from
  '@/app/super/institutions/[institutionId]/_components/tabs/FinanceTab'
import { SupportTab } from
  '@/app/super/institutions/[institutionId]/_components/tabs/SupportTab'
import { RiskTab } from
  '@/app/super/institutions/[institutionId]/_components/tabs/RiskTab'
import { AuditTab } from
  '@/app/super/institutions/[institutionId]/_components/tabs/AuditTab'

interface Props {
  institutionId: string
}

const API_BASE = '/api/school'

const TABS = [
  { value: 'overview', label: 'Overview' },
  { value: 'people', label: 'People' },
  { value: 'academic', label: 'Academic' },
  { value: 'engagement', label: 'Engagement' },
  { value: 'finance', label: 'Finance' },
  { value: 'support', label: 'Support' },
  { value: 'risk', label: 'Risk' },
  { value: 'audit', label: 'Audit' },
]

export function SchoolTabs({ institutionId }: Props) {
  return (
    <Tabs defaultValue="overview">
      <TabsList className="w-full justify-start border-b rounded-none
        h-auto p-0 bg-transparent overflow-x-auto flex">
        {TABS.map(tab => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className="rounded-none border-b-2 border-transparent
              data-[state=active]:border-primary
              data-[state=active]:bg-transparent
              data-[state=active]:shadow-none
              px-4 py-3 text-sm font-medium shrink-0"
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>

      <div className="mt-6">
        <TabsContent value="overview">
          <OverviewTab
            institutionId={institutionId}
            apiBase={API_BASE}
            isSchoolAdmin
          />
        </TabsContent>
        <TabsContent value="people">
          <PeopleTab institutionId={institutionId} apiBase={API_BASE} />
        </TabsContent>
        <TabsContent value="academic">
          <AcademicTab institutionId={institutionId} apiBase={API_BASE} />
        </TabsContent>
        <TabsContent value="engagement">
          <EngagementTab institutionId={institutionId} apiBase={API_BASE} />
        </TabsContent>
        <TabsContent value="finance">
          <FinanceTab institutionId={institutionId} apiBase={API_BASE} />
        </TabsContent>
        <TabsContent value="support">
          <SupportTab institutionId={institutionId} apiBase={API_BASE} />
        </TabsContent>
        <TabsContent value="risk">
          <RiskTab institutionId={institutionId} apiBase={API_BASE} />
        </TabsContent>
        <TabsContent value="audit">
          <AuditTab institutionId={institutionId} apiBase={API_BASE} />
        </TabsContent>
      </div>
    </Tabs>
  )
}
