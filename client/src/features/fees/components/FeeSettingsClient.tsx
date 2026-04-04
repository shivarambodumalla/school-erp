'use client'

import { useCallback, useEffect, useState } from 'react'
import { useInstitutionId } from '@/hooks/useInstitutionId'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useConfirm } from '@/components/ui/confirm-dialog'
import { getErrorMessage, isDependencyError } from '@/lib/api-error-handler'
import type { FeeSettingsData, FeeCategory } from '../types'
import { FREQ_LABELS } from '../types'

export function FeeSettingsClient() {
  const { apiParam, addParams } = useInstitutionId()
  const confirm = useConfirm()
  const [settings, setSettings] = useState<FeeSettingsData | null>(null)
  const [categories, setCategories] = useState<FeeCategory[]>([])

  const fetchSettings = useCallback(async () => {
    const sp = new URLSearchParams(); addParams(sp)
    const res = await fetch(`/api/school/settings/fees?${sp}`)
    if (res.ok) setSettings(await res.json())
  }, [addParams])

  const fetchCategories = useCallback(async () => {
    const sp = new URLSearchParams(); addParams(sp)
    const res = await fetch(`/api/school/fees/categories?${sp}`)
    if (res.ok) setCategories(await res.json())
  }, [addParams])

  useEffect(() => { fetchSettings(); fetchCategories() }, [fetchSettings, fetchCategories])

  const saveSettings = async (patch: Partial<FeeSettingsData>) => {
    const res = await fetch(`/api/school/settings/fees${apiParam}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    })
    if (res.ok) { setSettings(await res.json()); toast.success('Settings saved') }
    else toast.error('Failed to save')
  }

  const archiveCategory = async (id: string) => {
    try {
      const res = await fetch(`/api/school/fees/categories/${id}${apiParam}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'DEACTIVATE' }),
      })
      if (res.ok) { toast.success('Category archived'); fetchCategories() }
      else {
        const errData = await res.json().catch(() => ({ error: 'Failed to archive' })) as Record<string, unknown>
        toast.error(getErrorMessage(errData))
      }
    } catch { toast.error('Failed to archive category') }
  }

  const deleteCategory = async (id: string) => {
    const ok = await confirm({
      title: 'Delete Fee Category',
      description: 'Are you sure you want to delete this fee category?',
      destructive: true,
      confirmLabel: 'Delete',
      note: 'This action cannot be undone.',
    })
    if (!ok) return
    try {
      const res = await fetch(`/api/school/fees/categories/${id}${apiParam}`, { method: 'DELETE' })
      if (res.ok) { toast.success('Deleted'); fetchCategories(); return }
      const errData = await res.json().catch(() => ({ error: 'Cannot delete' })) as Record<string, unknown>
      if (isDependencyError(errData)) {
        const archiveOk = await confirm({
          title: 'Cannot Delete',
          description: getErrorMessage(errData),
          note: 'You can archive this category instead to hide it from new fee assignments.',
          confirmLabel: 'Archive Instead',
        })
        if (archiveOk) await archiveCategory(id)
      } else {
        toast.error(getErrorMessage(errData))
      }
    } catch { toast.error('Failed to delete category') }
  }

  if (!settings) {
    return <div className="flex items-center justify-center h-64">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Fee Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Configure fee categories, receipts, and payment options.</p>
      </div>

      {/* Receipt Settings */}
      <Card>
        <CardHeader><CardTitle className="text-base">Receipt Settings</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Receipt Prefix</Label>
              <Input value={settings.receiptPrefix}
                onChange={e => setSettings({ ...settings, receiptPrefix: e.target.value })}
                className="min-h-[44px] mt-1" />
            </div>
            <div>
              <Label>Starting Number</Label>
              <Input type="number" value={settings.receiptCurrentSeq}
                onChange={e => setSettings({ ...settings, receiptCurrentSeq: Number(e.target.value) })}
                className="min-h-[44px] mt-1" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Next: <span className="font-mono">{settings.receiptPrefix}-{new Date().getFullYear()}-{String(settings.receiptCurrentSeq).padStart(4, '0')}</span>
          </p>
          <Button size="sm" className="min-h-[44px]"
            onClick={() => saveSettings({ receiptPrefix: settings.receiptPrefix, receiptCurrentSeq: settings.receiptCurrentSeq })}>
            Save
          </Button>
        </CardContent>
      </Card>

      {/* Fee Categories */}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-base">Fee Categories</CardTitle>
          <Button size="sm" className="min-h-[44px] gap-1.5"><Plus className="h-4 w-4" /> Add</Button>
        </CardHeader>
        <CardContent>
          {categories.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No categories configured</p>
          ) : (
            <div className="space-y-2">
              {categories.map(c => (
                <div key={c.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="font-medium text-sm">{c.name}</p>
                    <p className="text-xs text-muted-foreground">
                      ₹{Number(c.amount).toLocaleString('en-IN')} · {FREQ_LABELS[c.frequency] ?? c.frequency}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {c.isOptional && <Badge variant="secondary">Optional</Badge>}
                    <Badge variant="secondary">{c.applicableTo}</Badge>
                    <Button variant="ghost" size="icon" className="min-h-[44px] min-w-[44px] text-destructive"
                      onClick={() => deleteCategory(c.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Options */}
      <Card>
        <CardHeader><CardTitle className="text-base">Payment Options</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Late Fine Enabled</Label>
            <Switch checked={settings.lateFineEnabled}
              onCheckedChange={v => saveSettings({ lateFineEnabled: v })} />
          </div>
          <div className="flex items-center justify-between">
            <Label>Partial Payment Allowed</Label>
            <Switch checked={settings.partialPaymentAllowed}
              onCheckedChange={v => saveSettings({ partialPaymentAllowed: v })} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
