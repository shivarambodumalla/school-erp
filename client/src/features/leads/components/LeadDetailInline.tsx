'use client'

import { useState, useEffect, useCallback } from 'react'
import { useInstitutionId } from '@/hooks/useInstitutionId'
import {
  Phone, Mail, MapPin, MessageSquare, Clock,
  CheckCircle2, ArrowRight, Plus,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from '@/components/ui/sheet'

/* ─── Types ─── */

interface FollowUp {
  id: string
  channel: string
  scheduledAt: string
  completedAt: string | null
  notes: string | null
  outcome: string | null
  createdAt: string
  staff: { id: string; firstName: string; lastName: string }
}

interface LeadDetail {
  id: string
  name: string
  phone: string
  email: string | null
  status: string
  source: string
  notes: string | null
  createdAt: string
  updatedAt: string
  assignedTo: { id: string; firstName: string; lastName: string } | null
  label: { id: string; name: string; color: string } | null
  targetClass: { id: string; name: string } | null
  followUps: FollowUp[]
}

/* ─── Pipeline steps ─── */

const PIPELINE_STEPS = ['NEW', 'CONTACTED', 'INTERESTED', 'APPLIED', 'CONVERTED'] as const

const PIPELINE_COLORS: Record<string, string> = {
  NEW: 'bg-blue-500',
  CONTACTED: 'bg-yellow-500',
  INTERESTED: 'bg-purple-500',
  APPLIED: 'bg-indigo-500',
  CONVERTED: 'bg-green-500',
}

const STATUS_LABELS: Record<string, string> = {
  NEW: 'New',
  CONTACTED: 'Contacted',
  INTERESTED: 'Interested',
  APPLIED: 'Applied',
  CONVERTED: 'Converted',
  LOST: 'Lost',
}

const SOURCE_LABELS: Record<string, string> = {
  WALK_IN: 'Walk-in',
  WEBSITE: 'Website',
  SOCIAL: 'Social',
  REFERRAL: 'Referral',
  OTHER: 'Other',
}

const CHANNEL_LABELS: Record<string, string> = {
  CALL: 'Call',
  WHATSAPP: 'WhatsApp',
  EMAIL: 'Email',
  SMS: 'SMS',
}

const CHANNEL_COLORS: Record<string, string> = {
  CALL: 'bg-blue-100 text-blue-700',
  WHATSAPP: 'bg-green-100 text-green-700',
  EMAIL: 'bg-purple-100 text-purple-700',
  SMS: 'bg-orange-100 text-orange-700',
}

/* ─── Component ─── */

export function LeadDetailInline({
  leadId,
  onStatusChange,
}: {
  leadId: string
  onStatusChange?: () => void
}) {
  const { addParams } = useInstitutionId()
  const [lead, setLead] = useState<LeadDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [notes, setNotes] = useState('')
  const [notesSaving, setNotesSaving] = useState(false)
  const [showFollowUpSheet, setShowFollowUpSheet] = useState(false)

  /* Fetch */
  const fetchLead = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    addParams(params)
    try {
      const res = await fetch(`/api/school/leads/${leadId}?${params}`)
      if (!res.ok) return
      const data = await res.json() as LeadDetail
      setLead(data)
      setNotes(data.notes ?? '')
    } catch { /* */ } finally {
      setLoading(false)
    }
  }, [leadId, addParams])

  useEffect(() => { fetchLead() }, [fetchLead])

  /* Update status */
  const updateStatus = useCallback(async (status: string) => {
    if (!lead) return
    const params = new URLSearchParams()
    addParams(params)
    try {
      const res = await fetch(`/api/school/leads/${leadId}?${params}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (res.ok) {
        const updated = await res.json() as LeadDetail
        setLead(prev => prev ? { ...prev, ...updated, followUps: prev.followUps } : prev)
        onStatusChange?.()
      }
    } catch { /* */ }
  }, [lead, leadId, addParams, onStatusChange])

  /* Save notes */
  const saveNotes = useCallback(async () => {
    if (!lead) return
    setNotesSaving(true)
    const params = new URLSearchParams()
    addParams(params)
    try {
      await fetch(`/api/school/leads/${leadId}?${params}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      })
    } catch { /* */ } finally {
      setNotesSaving(false)
    }
  }, [lead, leadId, notes, addParams])

  /* Mark lost */
  const markLost = useCallback(() => updateStatus('LOST'), [updateStatus])

  if (loading) {
    return (
      <div className="space-y-4 p-1">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="h-24 bg-muted animate-pulse rounded-xl" />
        <div className="h-16 bg-muted animate-pulse rounded-xl" />
        <div className="h-40 bg-muted animate-pulse rounded-xl" />
      </div>
    )
  }

  if (!lead) {
    return (
      <div className="text-center py-12 text-muted-foreground">Lead not found</div>
    )
  }

  const currentStep = PIPELINE_STEPS.indexOf(lead.status as typeof PIPELINE_STEPS[number])
  const isLost = lead.status === 'LOST'

  return (
    <div className="space-y-6 p-1">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">{lead.name}</h2>
          <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
            <span className="flex items-center gap-1">
              <Phone className="h-3.5 w-3.5" />
              {lead.phone}
            </span>
            {lead.email && (
              <span className="flex items-center gap-1">
                <Mail className="h-3.5 w-3.5" />
                {lead.email}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {lead.status === 'APPLIED' && (
            <Button size="sm" className="min-h-[44px] gap-1.5">
              <ArrowRight className="h-4 w-4" />
              Convert to Admission
            </Button>
          )}
          {!isLost && lead.status !== 'CONVERTED' && (
            <Button variant="outline" size="sm" className="min-h-[44px] text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={markLost}>
              Mark Lost
            </Button>
          )}
        </div>
      </div>

      {/* Info Card */}
      <div className="rounded-xl border bg-card p-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Source</p>
            <p className="font-medium">{SOURCE_LABELS[lead.source] ?? lead.source}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Target Class</p>
            <p className="font-medium">{lead.targetClass?.name ?? '\u2014'}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Assigned To</p>
            <p className="font-medium">
              {lead.assignedTo ? `${lead.assignedTo.firstName} ${lead.assignedTo.lastName}` : '\u2014'}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Label</p>
            {lead.label ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium"
                style={{ backgroundColor: `${lead.label.color}20`, color: lead.label.color }}>
                {lead.label.name}
              </span>
            ) : (
              <p className="font-medium">{'\u2014'}</p>
            )}
          </div>
        </div>
      </div>

      {/* Pipeline Bar */}
      <div className="rounded-xl border bg-card p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Pipeline</p>
        {isLost ? (
          <div className="flex items-center gap-2 text-red-600">
            <span className="h-3 w-3 rounded-full bg-red-500" />
            <span className="text-sm font-medium">Lost</span>
          </div>
        ) : (
          <div className="flex items-center gap-1">
            {PIPELINE_STEPS.map((step, idx) => {
              const isComplete = idx <= currentStep
              const isCurrent = idx === currentStep
              return (
                <button
                  key={step}
                  type="button"
                  onClick={() => updateStatus(step)}
                  className={`flex-1 flex flex-col items-center gap-1.5 py-2 px-1 rounded-lg transition-colors min-h-[44px]
                    ${isCurrent ? 'bg-muted' : 'hover:bg-muted/50'}`}
                >
                  <div className={`h-2.5 w-full rounded-full transition-colors
                    ${isComplete ? PIPELINE_COLORS[step] : 'bg-muted'}`} />
                  <span className={`text-[10px] sm:text-xs font-medium leading-tight
                    ${isComplete ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {STATUS_LABELS[step]}
                  </span>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Notes */}
      <div className="rounded-xl border bg-card p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Notes</p>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          onBlur={saveNotes}
          rows={4}
          placeholder="Add notes about this lead..."
          className="w-full rounded-md border px-3 py-2 text-sm resize-none bg-background"
        />
        {notesSaving && <p className="text-xs text-muted-foreground mt-1">Saving...</p>}
      </div>

      {/* Follow-ups */}
      <div className="rounded-xl border bg-card p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Follow-ups</p>
          <Button variant="outline" size="sm" className="min-h-[36px] gap-1.5"
            onClick={() => setShowFollowUpSheet(true)}>
            <Plus className="h-3.5 w-3.5" />
            Add
          </Button>
        </div>

        {lead.followUps.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">No follow-ups yet</p>
        ) : (
          <div className="space-y-3">
            {lead.followUps.map(fu => (
              <div key={fu.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                <div className={`shrink-0 mt-0.5 h-8 w-8 rounded-full flex items-center justify-center
                  ${fu.completedAt ? 'bg-green-100 text-green-600' : 'bg-muted text-muted-foreground'}`}>
                  {fu.completedAt
                    ? <CheckCircle2 className="h-4 w-4" />
                    : <Clock className="h-4 w-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${CHANNEL_COLORS[fu.channel] ?? 'bg-gray-100 text-gray-600'}`}>
                      {CHANNEL_LABELS[fu.channel] ?? fu.channel}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(fu.scheduledAt).toLocaleString()}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      by {fu.staff.firstName} {fu.staff.lastName}
                    </span>
                  </div>
                  {fu.notes && <p className="text-sm text-muted-foreground mt-1">{fu.notes}</p>}
                  {fu.outcome && <p className="text-sm text-foreground mt-1 font-medium">{fu.outcome}</p>}
                  {fu.channel === 'WHATSAPP' && lead && (
                    <a
                      href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi ${lead.name.split(' ')[0]}, following up regarding admission enquiry.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-green-600 hover:text-green-700 mt-1"
                    >
                      <MessageSquare className="h-3 w-3" />
                      Open WhatsApp
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Follow-up Sheet */}
      {showFollowUpSheet && (
        <AddFollowUpSheet
          leadId={leadId}
          leadStatus={lead.status}
          onClose={() => setShowFollowUpSheet(false)}
          onCreated={() => { setShowFollowUpSheet(false); fetchLead() }}
          addParams={addParams}
        />
      )}
    </div>
  )
}

/* ─── Add Follow-up Sheet ─── */

function AddFollowUpSheet({
  leadId,
  leadStatus,
  onClose,
  onCreated,
  addParams,
}: {
  leadId: string
  leadStatus: string
  onClose: () => void
  onCreated: () => void
  addParams: (p: URLSearchParams) => URLSearchParams
}) {
  // Auto-suggest timing based on lead status
  const suggestDays = leadStatus === 'CONTACTED' ? 2 : leadStatus === 'NEW' ? 1 : 3
  const suggestedDate = new Date()
  suggestedDate.setDate(suggestedDate.getDate() + suggestDays)
  suggestedDate.setHours(10, 0, 0, 0)

  const [form, setForm] = useState({
    channel: 'CALL',
    scheduledAt: suggestedDate.toISOString().slice(0, 16),
    notes: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    setSaving(true)
    setError('')
    const params = new URLSearchParams()
    addParams(params)
    try {
      const res = await fetch(`/api/school/leads/${leadId}/follow-ups?${params}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel: form.channel,
          scheduledAt: new Date(form.scheduledAt).toISOString(),
          notes: form.notes,
        }),
      })
      if (!res.ok) {
        const data = await res.json() as { error?: string }
        setError(data.error ?? 'Failed to create follow-up')
        return
      }
      onCreated()
    } catch {
      setError('Failed to create follow-up')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Sheet open onOpenChange={onClose}>
      <SheetContent side="right" className="w-[340px] sm:w-[400px] p-0 flex flex-col">
        <SheetHeader className="px-5 pt-5 pb-3 border-b">
          <SheetTitle>Schedule Follow-up</SheetTitle>
          <SheetDescription className="sr-only">Schedule a follow-up for this lead</SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {error && (
            <div className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</div>
          )}

          {/* Auto-suggestion hint */}
          <div className="text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
            {leadStatus === 'CONTACTED'
              ? 'Suggested: Follow up in 2 days after initial contact'
              : leadStatus === 'NEW'
                ? 'Suggested: Contact within 1 day of enquiry'
                : 'Suggested: Follow up in 3 days'}
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Channel *</label>
            <select
              value={form.channel}
              onChange={e => setForm(prev => ({ ...prev, channel: e.target.value }))}
              className="w-full rounded-md border px-3 py-2.5 text-sm min-h-[44px] bg-background"
            >
              <option value="CALL">Call</option>
              <option value="WHATSAPP">WhatsApp</option>
              <option value="EMAIL">Email</option>
              <option value="SMS">SMS</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Scheduled At *</label>
            <Input
              type="datetime-local"
              value={form.scheduledAt}
              onChange={e => setForm(prev => ({ ...prev, scheduledAt: e.target.value }))}
              className="min-h-[44px]"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Notes</label>
            <textarea
              value={form.notes}
              onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              placeholder="What to discuss..."
              className="w-full rounded-md border px-3 py-2 text-sm resize-none bg-background"
            />
          </div>
        </div>
        <div className="px-5 py-3 border-t flex gap-2">
          <Button variant="outline" className="flex-1 min-h-[44px]" onClick={onClose}>Cancel</Button>
          <Button className="flex-1 min-h-[44px]" onClick={handleSubmit} disabled={saving}>
            {saving ? 'Scheduling...' : 'Schedule'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
