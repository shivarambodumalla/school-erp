'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, Mail, Phone, Building2, MessageCircle, Loader2, Users } from 'lucide-react'

type Status = 'NEW' | 'CONTACTED' | 'DEMO_SCHEDULED' | 'CONVERTED' | 'REJECTED'
const STATUSES: Status[] = ['NEW', 'CONTACTED', 'DEMO_SCHEDULED', 'CONVERTED', 'REJECTED']

interface MarketingLead {
  id: string
  name: string
  schoolName: string
  email: string
  phone: string
  schoolSize: string | null
  message: string | null
  status: Status
  source: string
  notes: string | null
  contactedAt: string | null
  createdAt: string
  updatedAt: string
}

interface ApiResponse {
  records: MarketingLead[]
  total: number
  counts: Record<string, number>
}

const STATUS_STYLES: Record<Status, string> = {
  NEW: 'bg-primary/10 text-primary ring-primary/30',
  CONTACTED: 'bg-chart-1/20 text-foreground ring-chart-1/40',
  DEMO_SCHEDULED: 'bg-secondary/15 text-secondary ring-secondary/30',
  CONVERTED: 'bg-secondary text-secondary-foreground ring-secondary',
  REJECTED: 'bg-destructive/10 text-destructive ring-destructive/30',
}

const STATUS_LABELS: Record<Status, string> = {
  NEW: 'New',
  CONTACTED: 'Contacted',
  DEMO_SCHEDULED: 'Demo scheduled',
  CONVERTED: 'Converted',
  REJECTED: 'Rejected',
}

export function MarketingLeadsClient(): JSX.Element {
  const [leads, setLeads] = useState<MarketingLead[]>([])
  const [total, setTotal] = useState(0)
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [activeStatus, setActiveStatus] = useState<Status | 'ALL'>('ALL')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [selected, setSelected] = useState<MarketingLead | null>(null)

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 250)
    return () => clearTimeout(t)
  }, [search])

  const fetchLeads = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (activeStatus !== 'ALL') params.set('status', activeStatus)
      if (debouncedSearch) params.set('search', debouncedSearch)
      params.set('take', '100')
      const res = await fetch(`/api/super/marketing-leads?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to load leads')
      const data = (await res.json()) as ApiResponse
      setLeads(data.records)
      setTotal(data.total)
      setCounts(data.counts)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load leads')
    } finally {
      setLoading(false)
    }
  }, [activeStatus, debouncedSearch])

  useEffect(() => {
    fetchLeads()
  }, [fetchLeads])

  const handlePatch = useCallback(
    async (id: string, patch: Partial<{ status: Status; notes: string | null }>) => {
      try {
        const res = await fetch('/api/super/marketing-leads', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, ...patch }),
        })
        if (!res.ok) throw new Error('Update failed')
        const updated = (await res.json()) as MarketingLead
        setLeads((prev) => prev.map((l) => (l.id === id ? updated : l)))
        if (selected?.id === id) setSelected(updated)
        toast.success('Lead updated')
        // refresh counts
        fetchLeads()
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Update failed')
      }
    },
    [fetchLeads, selected],
  )

  const statusPills = useMemo(
    () => [
      { key: 'ALL' as const, label: 'All', count: total },
      ...STATUSES.map((s) => ({ key: s, label: STATUS_LABELS[s], count: counts[s] ?? 0 })),
    ],
    [counts, total],
  )

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight sm:text-3xl">
            <Users className="h-6 w-6 text-primary" />
            Marketing Leads
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Schools that requested a demo via the Get Started form.
          </p>
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, school, email..."
            className="min-h-[44px] w-full pl-9 sm:w-72"
          />
        </div>
      </div>

      {/* Status filter pills */}
      <div className="mt-6 flex flex-wrap gap-2">
        {statusPills.map((p) => (
          <button
            key={p.key}
            onClick={() => setActiveStatus(p.key)}
            className={`inline-flex min-h-[40px] items-center gap-2 rounded-xl border px-3.5 text-sm font-semibold transition-colors ${
              activeStatus === p.key
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-card hover:border-primary/40'
            }`}
          >
            {p.label}
            <span
              className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
                activeStatus === p.key ? 'bg-primary-foreground/20' : 'bg-muted'
              }`}
            >
              {p.count}
            </span>
          </button>
        ))}
      </div>

      {/* Results */}
      <div className="mt-6">
        {loading ? (
          <div className="flex min-h-[200px] items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : leads.length === 0 ? (
          <div className="flex min-h-[200px] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20 text-center">
            <Users className="h-8 w-8 text-muted-foreground/60" />
            <p className="mt-3 text-sm font-semibold">No leads found</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {debouncedSearch || activeStatus !== 'ALL'
                ? 'Try changing filters'
                : 'Leads from the Get Started form will appear here'}
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <div className="hidden grid-cols-12 gap-4 border-b border-border bg-muted/30 px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground sm:grid">
              <div className="col-span-3">Name · School</div>
              <div className="col-span-3">Contact</div>
              <div className="col-span-2">Size</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2">Received</div>
            </div>
            {leads.map((lead) => (
              <button
                key={lead.id}
                onClick={() => setSelected(lead)}
                className="grid w-full grid-cols-1 gap-2 border-b border-border px-5 py-4 text-left transition-colors last:border-b-0 hover:bg-muted/30 sm:grid-cols-12 sm:gap-4 sm:py-3"
              >
                <div className="col-span-3">
                  <div className="text-sm font-semibold">{lead.name}</div>
                  <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                    <Building2 className="h-3 w-3" />
                    {lead.schoolName}
                  </div>
                </div>
                <div className="col-span-3">
                  <div className="flex items-center gap-1 text-xs">
                    <Mail className="h-3 w-3 text-muted-foreground" />
                    <span className="truncate">{lead.email}</span>
                  </div>
                  <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                    <Phone className="h-3 w-3" />
                    {lead.phone}
                  </div>
                </div>
                <div className="col-span-2 text-xs text-muted-foreground">
                  {lead.schoolSize ?? '—'}
                </div>
                <div className="col-span-2">
                  <span
                    className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold ring-1 ${STATUS_STYLES[lead.status]}`}
                  >
                    {STATUS_LABELS[lead.status]}
                  </span>
                </div>
                <div className="col-span-2 text-xs text-muted-foreground">
                  {new Date(lead.createdAt).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Detail sheet */}
      <LeadDetailSheet lead={selected} onClose={() => setSelected(null)} onPatch={handlePatch} />
    </div>
  )
}

function LeadDetailSheet({
  lead,
  onClose,
  onPatch,
}: {
  lead: MarketingLead | null
  onClose: () => void
  onPatch: (id: string, patch: Partial<{ status: Status; notes: string | null }>) => Promise<void>
}): JSX.Element {
  const [notes, setNotes] = useState(lead?.notes ?? '')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setNotes(lead?.notes ?? '')
  }, [lead])

  if (!lead) {
    return (
      <Sheet open={false} onOpenChange={(o) => !o && onClose()}>
        <SheetContent />
      </Sheet>
    )
  }

  const waUrl = `https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
    `Hi ${lead.name}, this is from Onflows following up on your demo request for ${lead.schoolName}.`,
  )}`

  async function saveNotes(): Promise<void> {
    if (!lead) return
    setSaving(true)
    await onPatch(lead.id, { notes: notes.trim() || null })
    setSaving(false)
  }

  return (
    <Sheet open={!!lead} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="text-xl">{lead.name}</SheetTitle>
          <SheetDescription className="flex items-center gap-1 text-sm">
            <Building2 className="h-3.5 w-3.5" />
            {lead.schoolName}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-5">
          {/* Contact block */}
          <div className="space-y-2 rounded-xl bg-muted/30 p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a
                  href={`mailto:${lead.email}`}
                  className="font-medium text-primary hover:underline"
                >
                  {lead.email}
                </a>
              </div>
            </div>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <a href={`tel:${lead.phone}`} className="font-medium text-primary hover:underline">
                  {lead.phone}
                </a>
              </div>
              <a
                href={waUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg bg-secondary/15 px-3 py-1.5 text-xs font-semibold text-secondary transition-colors hover:bg-secondary/25"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                WhatsApp
              </a>
            </div>
            {lead.schoolSize ? (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Users className="h-3.5 w-3.5" />
                {lead.schoolSize}
              </div>
            ) : null}
          </div>

          {/* Message */}
          {lead.message ? (
            <div>
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Their message
              </Label>
              <p className="mt-2 rounded-xl border border-border bg-background p-3 text-sm leading-relaxed">
                {lead.message}
              </p>
            </div>
          ) : null}

          {/* Status */}
          <div>
            <Label
              htmlFor="lead-status"
              className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              Status
            </Label>
            <Select
              value={lead.status}
              onValueChange={(v) => onPatch(lead.id, { status: v as Status })}
            >
              <SelectTrigger id="lead-status" className="mt-2 min-h-[44px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div>
            <Label
              htmlFor="lead-notes"
              className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              Internal notes
            </Label>
            <Textarea
              id="lead-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="mt-2"
              placeholder="Add internal notes about this lead..."
            />
            <Button
              variant="secondary"
              className="mt-2 min-h-[40px] rounded-xl"
              onClick={saveNotes}
              disabled={saving || notes === (lead.notes ?? '')}
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save notes'
              )}
            </Button>
          </div>

          {/* Meta */}
          <div className="space-y-1 border-t border-border pt-4 text-xs text-muted-foreground">
            <div>Received: {new Date(lead.createdAt).toLocaleString('en-IN')}</div>
            {lead.contactedAt ? (
              <div>Contacted: {new Date(lead.contactedAt).toLocaleString('en-IN')}</div>
            ) : null}
            <div>Source: {lead.source}</div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
