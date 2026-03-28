'use client'

import { useState } from 'react'
import { X, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface Props {
  onClose: () => void
  onCreated: () => void
}

const SOURCES = [
  { value: 'WALK_IN', label: 'Walk-in' },
  { value: 'PHONE', label: 'Phone' },
  { value: 'WEBSITE', label: 'Website' },
  { value: 'REFERRAL', label: 'Referral' },
  { value: 'OTHER', label: 'Other' },
]

export function InquirySheet({ onClose, onCreated }: Props) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [source, setSource] = useState('WALK_IN')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSubmit() {
    if (!name || !phone) return
    setSaving(true)
    try {
      const res = await fetch('/api/school/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, email: email || undefined, source, notes: notes || undefined }),
      })
      if (res.ok) {
        toast.success('Inquiry captured')
        onCreated()
        onClose()
      } else {
        const data = await res.json()
        toast.error(data.error ?? 'Failed')
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50">
      <div className="bg-background w-full max-w-sm h-full border-l shadow-xl
        flex flex-col animate-in slide-in-from-right">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">New Inquiry</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="space-y-1.5">
            <Label>Name *</Label>
            <Input value={name} onChange={e => setName(e.target.value)}
              className="min-h-[44px]" />
          </div>
          <div className="space-y-1.5">
            <Label>Phone *</Label>
            <Input value={phone} onChange={e => setPhone(e.target.value)}
              className="min-h-[44px]" />
          </div>
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input value={email} onChange={e => setEmail(e.target.value)}
              type="email" className="min-h-[44px]" />
          </div>
          <div className="space-y-1.5">
            <Label>Source</Label>
            <select value={source} onChange={e => setSource(e.target.value)}
              className="w-full h-11 rounded-md border border-input bg-background px-3 text-sm">
              {SOURCES.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label>Notes</Label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)}
              rows={3}
              className="w-full rounded-md border border-input bg-background
                px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1
                focus:ring-primary" />
          </div>
        </div>

        <div className="p-4 border-t">
          <Button className="w-full min-h-[44px]" onClick={handleSubmit}
            disabled={!name || !phone || saving}>
            {saving && <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />}
            Save Inquiry
          </Button>
        </div>
      </div>
    </div>
  )
}
