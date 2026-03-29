'use client'

import { useState, useEffect, useCallback } from 'react'
import { useInstitutionId } from '@/hooks/useInstitutionId'
import { Card } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

interface Preferences {
  channels: Record<string, boolean>
  types: Record<string, boolean>
  quietHoursStart: string
  quietHoursEnd: string
}

const CHANNELS = [
  { key: 'PUSH', label: 'Push Notifications' },
  { key: 'EMAIL', label: 'Email' },
  { key: 'SMS', label: 'SMS' },
  { key: 'WHATSAPP', label: 'WhatsApp' },
]

const TYPE_GROUPS: Record<string, { key: string; label: string }[]> = {
  Academic: [
    { key: 'GRADE_PUBLISHED', label: 'Grade Published' },
    { key: 'ASSIGNMENT_DUE', label: 'Assignment Due' },
    { key: 'QUIZ_AVAILABLE', label: 'Quiz Available' },
    { key: 'HOMEWORK_ASSIGNED', label: 'Homework Assigned' },
  ],
  Attendance: [
    { key: 'ATTENDANCE_ABSENT', label: 'Absence Alert' },
    { key: 'ATTENDANCE_SUMMARY', label: 'Attendance Summary' },
  ],
  Finance: [
    { key: 'FEE_DUE', label: 'Fee Due' },
    { key: 'FEE_PAID', label: 'Fee Paid' },
    { key: 'FEE_OVERDUE', label: 'Fee Overdue' },
  ],
  School: [
    { key: 'ANNOUNCEMENT', label: 'Announcements' },
    { key: 'LEAVE_APPROVED', label: 'Leave Approved' },
    { key: 'LEAVE_REJECTED', label: 'Leave Rejected' },
    { key: 'SUBSTITUTION', label: 'Substitution' },
    { key: 'GENERAL', label: 'General' },
    { key: 'SYSTEM', label: 'System' },
  ],
}

export function NotificationPreferencesClient() {
  const { apiParam } = useInstitutionId()
  const [prefs, setPrefs] = useState<Preferences | null>(null)

  useEffect(() => {
    fetch(`/api/school/notifications/preferences${apiParam}`)
      .then(r => r.json())
      .then(data => setPrefs({
        channels: data.channels ?? {},
        types: data.types ?? {},
        quietHoursStart: data.quietHoursStart ?? '22:00',
        quietHoursEnd: data.quietHoursEnd ?? '07:00',
      }))
  }, [apiParam])

  const save = useCallback(async (updated: Preferences) => {
    setPrefs(updated)
    await fetch(`/api/school/notifications/preferences${apiParam}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    })
    toast.success('Preferences saved')
  }, [apiParam])

  if (!prefs) return (
    <div className="flex justify-center py-12">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Notification Preferences</h1>
        <p className="text-sm text-muted-foreground mt-1">Control how you receive notifications</p>
      </div>

      <Card className="p-5 space-y-4">
        <h2 className="font-semibold">Channels</h2>
        {CHANNELS.map(ch => (
          <div key={ch.key} className="flex items-center justify-between min-h-[44px]">
            <span className="text-sm">{ch.label}</span>
            <Switch checked={prefs.channels[ch.key] ?? true}
              onCheckedChange={v => save({ ...prefs, channels: { ...prefs.channels, [ch.key]: v } })} />
          </div>
        ))}
      </Card>

      {Object.entries(TYPE_GROUPS).map(([group, types]) => (
        <Card key={group} className="p-5 space-y-4">
          <h2 className="font-semibold">{group}</h2>
          {types.map(t => (
            <div key={t.key} className="flex items-center justify-between min-h-[44px]">
              <span className="text-sm">{t.label}</span>
              <Switch checked={prefs.types[t.key] ?? true}
                onCheckedChange={v => save({ ...prefs, types: { ...prefs.types, [t.key]: v } })} />
            </div>
          ))}
        </Card>
      ))}

      <Card className="p-5 space-y-4">
        <h2 className="font-semibold">Quiet Hours</h2>
        <p className="text-sm text-muted-foreground">No notifications during these hours</p>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Start</label>
            <Input type="time" value={prefs.quietHoursStart} className="min-h-[44px]"
              onChange={e => save({ ...prefs, quietHoursStart: e.target.value })} />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">End</label>
            <Input type="time" value={prefs.quietHoursEnd} className="min-h-[44px]"
              onChange={e => save({ ...prefs, quietHoursEnd: e.target.value })} />
          </div>
        </div>
      </Card>
    </div>
  )
}
