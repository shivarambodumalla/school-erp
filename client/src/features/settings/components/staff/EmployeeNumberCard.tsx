'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Hash } from 'lucide-react'
import { toast } from 'sonner'
import type { StaffSettingsData } from './types'

interface Props {
  settings: StaffSettingsData
  onUpdate: (s: StaffSettingsData) => void
}

export function EmployeeNumberCard({ settings, onUpdate }: Props) {
  const [prefix, setPrefix] = useState(settings.employeeNoPrefix)
  const [seq, setSeq] = useState(settings.employeeNoCurrentSeq)
  const [saving, setSaving] = useState(false)

  const preview = `${prefix}${seq}`

  const save = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/school/settings/staff', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeNoPrefix: prefix, employeeNoCurrentSeq: seq }),
      })
      if (res.ok) {
        const data = await res.json()
        onUpdate(data)
        toast.success('Employee number format saved')
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Hash className="h-5 w-5" />
          Employee Number Format
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="space-y-1">
            <Label>Prefix</Label>
            <Input
              value={prefix}
              onChange={(e) => setPrefix(e.target.value)}
              placeholder="EMP"
              className="w-28"
            />
          </div>
          <div className="space-y-1">
            <Label>Starting Number</Label>
            <Input
              type="number"
              min={1}
              value={seq}
              onChange={(e) => setSeq(Number(e.target.value))}
              className="w-32"
            />
          </div>
          <Button
            className="min-h-[44px]"
            onClick={save}
            disabled={saving || !prefix.trim()}
          >
            Save
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Next: <span className="font-mono font-medium">{preview}</span>
        </p>
      </CardContent>
    </Card>
  )
}
