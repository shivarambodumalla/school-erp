'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger }
  from '@/components/ui/tabs'
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
  planTier: string
  themePalette: unknown
  themeAppliedAt: string | null
}

interface Props {
  institutionId: string
  institution: Institution
  apiBase: string
}

const TABS = [
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
          <OverviewTab institutionId={institutionId} apiBase={apiBase} />
        </TabsContent>
        <TabsContent value="people">
          <PeopleTab institutionId={institutionId} apiBase={apiBase} />
        </TabsContent>
        <TabsContent value="academic">
          <AcademicTab institutionId={institutionId} apiBase={apiBase} />
        </TabsContent>
        <TabsContent value="engagement">
          <EngagementTab institutionId={institutionId} apiBase={apiBase} />
        </TabsContent>
        <TabsContent value="finance">
          <FinanceTab institutionId={institutionId} apiBase={apiBase} />
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
