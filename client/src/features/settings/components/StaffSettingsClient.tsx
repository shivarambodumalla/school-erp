'use client'

import { useCallback, useEffect, useState } from 'react'
import { EmployeeNumberCard } from './staff/EmployeeNumberCard'
import { DepartmentsCard } from './staff/DepartmentsCard'
import { LeaveTypesCard } from './staff/LeaveTypesCard'
import { SalaryComponentsCard } from './staff/SalaryComponentsCard'
import { StaffDocumentTypesCard } from './staff/DocumentTypesCard'
import type { StaffSettingsData } from './staff/types'

export function StaffSettingsClient() {
  const [settings, setSettings] = useState<StaffSettingsData | null>(null)

  const fetchSettings = useCallback(async () => {
    const res = await fetch('/api/school/settings/staff')
    if (res.ok) setSettings(await res.json())
  }, [])

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  if (!settings) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Staff Settings
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Configure employee numbering, departments, leave types, salary
          components, and document types.
        </p>
      </div>

      <EmployeeNumberCard settings={settings} onUpdate={setSettings} />
      <DepartmentsCard />
      <LeaveTypesCard />
      <SalaryComponentsCard />
      <StaffDocumentTypesCard settings={settings} onUpdate={setSettings} />
    </div>
  )
}
