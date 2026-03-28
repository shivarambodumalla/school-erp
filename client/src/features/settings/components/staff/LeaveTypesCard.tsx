'use client'

import { useCallback, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { CalendarDays, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import type { LeaveTypeRow } from './types'

export function LeaveTypesCard() {
  const [types, setTypes] = useState<LeaveTypeRow[]>([])
  const [loaded, setLoaded] = useState(false)
  const [showAdd, setShowAdd] = useState(false)
  const [name, setName] = useState('')
  const [shortName, setShortName] = useState('')
  const [maxDays, setMaxDays] = useState(12)
  const [carry, setCarry] = useState(false)
  const [paid, setPaid] = useState(true)
  const [saving, setSaving] = useState(false)

  const refresh = useCallback(async () => {
    const res = await fetch('/api/school/settings/leave-types')
    if (res.ok) { setTypes(await res.json()); setLoaded(true) }
  }, [])

  if (!loaded) refresh()

  const add = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/school/settings/leave-types', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name, shortName, maxDaysPerYear: maxDays, carryForward: carry, isPaid: paid,
        }),
      })
      if (res.status === 409) { toast.error('Leave type name already exists'); return }
      if (res.ok) {
        setShowAdd(false); setName(''); setShortName('')
        setMaxDays(12); setCarry(false); setPaid(true)
        toast.success('Leave type added')
        await refresh()
      }
    } finally { setSaving(false) }
  }

  const remove = async (id: string) => {
    const res = await fetch(`/api/school/settings/leave-types/${id}`, { method: 'DELETE' })
    if (!res.ok) { const err = await res.json(); toast.error(err.error); return }
    toast.success('Leave type deleted')
    await refresh()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" /> Leave Types
          </span>
          <Button size="sm" className="min-h-[44px]" onClick={() => setShowAdd(!showAdd)}>
            {showAdd ? 'Cancel' : 'Add'}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {showAdd && (
          <div className="flex flex-wrap gap-2 items-end border rounded-lg p-3">
            <div className="space-y-1"><Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Casual Leave" />
            </div>
            <div className="space-y-1"><Label>Short</Label>
              <Input value={shortName} onChange={(e) => setShortName(e.target.value)} placeholder="CL" className="w-20" />
            </div>
            <div className="space-y-1"><Label>Max Days</Label>
              <Input type="number" min={1} value={maxDays} onChange={(e) => setMaxDays(Number(e.target.value))} className="w-20" />
            </div>
            <div className="flex items-center gap-2 pb-1">
              <Switch checked={carry} onCheckedChange={setCarry} /><Label>Carry Forward</Label>
            </div>
            <div className="flex items-center gap-2 pb-1">
              <Switch checked={paid} onCheckedChange={setPaid} /><Label>Paid</Label>
            </div>
            <Button className="min-h-[44px]" onClick={add} disabled={saving || !name.trim() || !shortName.trim()}>
              Save
            </Button>
          </div>
        )}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Short</TableHead>
              <TableHead className="text-right">Max Days</TableHead>
              <TableHead>Carry Forward</TableHead>
              <TableHead>Paid</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {types.map((lt) => (
              <TableRow key={lt.id}>
                <TableCell className="font-medium">{lt.name}</TableCell>
                <TableCell>{lt.shortName}</TableCell>
                <TableCell className="text-right">{lt.maxDaysPerYear}</TableCell>
                <TableCell>{lt.carryForward ? 'Yes' : 'No'}</TableCell>
                <TableCell>{lt.isPaid ? 'Yes' : 'No'}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" className="min-h-[44px] min-w-[44px] text-destructive" onClick={() => remove(lt.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {loaded && types.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                  No leave types configured yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
