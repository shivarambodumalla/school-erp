'use client'

import { useState } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from
  '@/components/ui/tabs'
import { AttendanceMarking } from './AttendanceMarking'
import { AttendanceSummaryTable } from './AttendanceSummaryTable'
import type { SectionOption, AttendanceMode } from '../types'

interface Props {
  sections: SectionOption[]
  mode: AttendanceMode
}

export function AttendanceClient({ sections, mode }: Props) {
  const [tab, setTab] = useState<string>('daily')

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Attendance
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Mark and track daily student attendance
        </p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="daily" className="min-h-[44px]">
            Daily
          </TabsTrigger>
          <TabsTrigger value="summary" className="min-h-[44px]">
            Summary
          </TabsTrigger>
        </TabsList>

        <TabsContent value="daily">
          <AttendanceMarking sections={sections} mode={mode} />
        </TabsContent>

        <TabsContent value="summary">
          <AttendanceSummaryTable sections={sections} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
