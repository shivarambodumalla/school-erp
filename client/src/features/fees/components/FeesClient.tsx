'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FeeOverviewTab } from './tabs/FeeOverviewTab'
import { FeeCollectTab } from './tabs/FeeCollectTab'
import { FeeConcessionsTab } from './tabs/FeeConcessionsTab'

export function FeesClient() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Fees</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Fee collection, tracking, and reporting
        </p>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="collect">Collect</TabsTrigger>
          <TabsTrigger value="concessions">Concessions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <FeeOverviewTab />
        </TabsContent>
        <TabsContent value="collect">
          <FeeCollectTab />
        </TabsContent>
        <TabsContent value="concessions">
          <FeeConcessionsTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
