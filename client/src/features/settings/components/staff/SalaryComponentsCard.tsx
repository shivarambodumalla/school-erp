'use client'

import { useCallback, useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Banknote, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import type { SalaryConfigData } from './types'

function ListSection({
  title,
  items,
  onAdd,
  onRemove,
}: {
  title: string
  items: string[]
  onAdd: (val: string) => void
  onRemove: (idx: number) => void
}) {
  const [value, setValue] = useState('')

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">{title}</p>
      <div className="flex gap-2">
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={`Add ${title.toLowerCase().slice(0, -1)}`}
          className="flex-1"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && value.trim()) {
              onAdd(value.trim())
              setValue('')
            }
          }}
        />
        <Button
          variant="outline"
          size="icon"
          className="min-h-[44px] min-w-[44px]"
          disabled={!value.trim()}
          onClick={() => { onAdd(value.trim()); setValue('') }}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <div className="divide-y rounded-lg border">
        {items.map((item, idx) => (
          <div key={item} className="flex items-center justify-between px-4 py-2">
            <span className="text-sm">{item}</span>
            <Button
              variant="ghost" size="icon"
              className="min-h-[44px] min-w-[44px] text-destructive"
              onClick={() => onRemove(idx)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        {items.length === 0 && (
          <p className="px-4 py-4 text-center text-sm text-muted-foreground">
            None added yet.
          </p>
        )}
      </div>
    </div>
  )
}

export function SalaryComponentsCard() {
  const [config, setConfig] = useState<SalaryConfigData | null>(null)
  const refresh = useCallback(async () => {
    const res = await fetch('/api/school/settings/salary-config')
    if (res.ok) { setConfig(await res.json()) }
  }, [])

  useEffect(() => { refresh() }, [refresh])

  const save = async (patch: { allowanceTypes?: string[]; deductionTypes?: string[] }) => {
    const res = await fetch('/api/school/settings/salary-config', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    })
    if (res.ok) {
      setConfig(await res.json())
      toast.success('Salary components updated')
    }
  }

  const allowances = (config?.allowanceTypes ?? []) as string[]
  const deductions = (config?.deductionTypes ?? []) as string[]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Banknote className="h-5 w-5" /> Salary Components
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6 sm:grid-cols-2">
        <ListSection
          title="Allowances"
          items={allowances}
          onAdd={(v) => save({ allowanceTypes: [...allowances, v] })}
          onRemove={(i) => save({ allowanceTypes: allowances.filter((_, idx) => idx !== i) })}
        />
        <ListSection
          title="Deductions"
          items={deductions}
          onAdd={(v) => save({ deductionTypes: [...deductions, v] })}
          onRemove={(i) => save({ deductionTypes: deductions.filter((_, idx) => idx !== i) })}
        />
      </CardContent>
    </Card>
  )
}
