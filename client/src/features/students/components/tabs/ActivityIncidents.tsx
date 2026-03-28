'use client'

import { useState } from 'react'
import { ShieldCheck, Plus, X, Loader2, Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

interface Incident {
  id: string; type: string; date: string; description: string
  actionTaken: string | null; severity: string
  parentNotified: boolean; createdAt: string
}

interface Props {
  incidents: Incident[]
  studentId: string
  isAdmin: boolean
  onRefresh: () => void
}

const SEV_COLORS: Record<string, string> = {
  MINOR: 'bg-gray-400',
  MODERATE: 'bg-amber-400',
  SERIOUS: 'bg-red-500',
}

const TYPE_LABELS: Record<string, string> = {
  LATE_ARRIVAL: 'Late Arrival',
  RULE_VIOLATION: 'Rule Violation',
  FIGHT: 'Fight',
  OTHER: 'Other',
}

const TYPES = ['LATE_ARRIVAL', 'RULE_VIOLATION', 'FIGHT', 'OTHER']
const SEVERITIES = ['MINOR', 'MODERATE', 'SERIOUS']

export function IncidentsSection({ incidents, studentId, isAdmin, onRefresh }: Props) {
  const [showForm, setShowForm] = useState(false)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Behaviour & Discipline</h3>
        {isAdmin && (
          <Button size="sm" variant="outline" className="min-h-[44px]"
            onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-1" /> Log Incident
          </Button>
        )}
      </div>

      {incidents.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-8 text-green-600
          rounded-xl border bg-green-50">
          <ShieldCheck className="h-8 w-8" />
          <p className="text-sm">No incidents recorded</p>
        </div>
      ) : (
        <div className="space-y-2">
          {incidents.map(inc => (
            <div key={inc.id} className="rounded-lg border p-3 flex items-start gap-3">
              <span className={`h-2.5 w-2.5 rounded-full mt-1.5 shrink-0
                ${SEV_COLORS[inc.severity] ?? 'bg-gray-400'}`} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded
                    bg-muted">{TYPE_LABELS[inc.type] ?? inc.type}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(inc.date).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })}
                  </span>
                  {inc.parentNotified && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100
                      text-blue-700 flex items-center gap-0.5">
                      <Bell className="h-2.5 w-2.5" /> Parent notified
                    </span>
                  )}
                </div>
                <p className="text-sm mt-1">{inc.description}</p>
                {inc.actionTaken && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Action: {inc.actionTaken}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <LogIncidentForm
          studentId={studentId}
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); onRefresh() }}
        />
      )}
    </div>
  )
}

function LogIncidentForm({ studentId, onClose, onSaved }: {
  studentId: string; onClose: () => void; onSaved: () => void
}) {
  const [type, setType] = useState('LATE_ARRIVAL')
  const [date, setDate] = useState('')
  const [description, setDescription] = useState('')
  const [actionTaken, setActionTaken] = useState('')
  const [severity, setSeverity] = useState('MINOR')
  const [parentNotified, setParentNotified] = useState(false)
  const [saving, setSaving] = useState(false)

  async function handleSubmit() {
    if (!date || !description) return
    setSaving(true)
    const res = await fetch(`/api/school/students/${studentId}/incidents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type, date, description,
        actionTaken: actionTaken || undefined,
        severity, parentNotified,
      }),
    })
    setSaving(false)
    if (res.ok) { toast.success('Incident logged'); onSaved() }
    else { const d = await res.json(); toast.error(d.error ?? 'Failed') }
  }

  return (
    <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Log Incident</span>
        <button onClick={onClose} className="p-1 rounded hover:bg-muted">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="space-y-1">
          <Label>Type</Label>
          <select value={type} onChange={e => setType(e.target.value)}
            className="w-full h-11 rounded-md border border-input bg-background px-3 text-sm">
            {TYPES.map(t => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
          </select>
        </div>
        <div className="space-y-1">
          <Label>Date *</Label>
          <Input type="date" value={date} onChange={e => setDate(e.target.value)}
            className="min-h-[44px]" />
        </div>
        <div className="space-y-1">
          <Label>Severity</Label>
          <select value={severity} onChange={e => setSeverity(e.target.value)}
            className="w-full h-11 rounded-md border border-input bg-background px-3 text-sm">
            {SEVERITIES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>
      <div className="space-y-1">
        <Label>Description *</Label>
        <textarea value={description} onChange={e => setDescription(e.target.value)}
          rows={2} className="w-full rounded-md border border-input bg-background
            px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary" />
      </div>
      <div className="space-y-1">
        <Label>Action Taken</Label>
        <Input value={actionTaken} onChange={e => setActionTaken(e.target.value)}
          className="min-h-[44px]" />
      </div>
      <label className="flex items-center gap-2 text-sm cursor-pointer min-h-[44px]">
        <input type="checkbox" checked={parentNotified}
          onChange={e => setParentNotified(e.target.checked)}
          className="rounded border-input" />
        Parent notified
      </label>
      <Button size="sm" onClick={handleSubmit} disabled={!date || !description || saving}>
        {saving && <Loader2 className="h-4 w-4 mr-1 animate-spin" />} Save
      </Button>
    </div>
  )
}
