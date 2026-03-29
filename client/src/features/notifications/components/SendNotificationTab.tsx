'use client'

import { useState } from 'react'
import { useInstitutionId } from '@/hooks/useInstitutionId'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { toast } from 'sonner'

const TYPES = [
  'ANNOUNCEMENT', 'FEE_DUE', 'ATTENDANCE_ABSENT', 'GRADE_PUBLISHED',
  'ASSIGNMENT_DUE', 'HOMEWORK_ASSIGNED', 'GENERAL', 'SYSTEM',
] as const

const TARGETS = ['EVERYONE', 'CLASS', 'SECTION', 'ROLE', 'USERS'] as const

const TARGET_LABELS: Record<string, string> = {
  EVERYONE: 'Everyone', CLASS: 'By Class', SECTION: 'By Section',
  ROLE: 'By Role', USERS: 'Specific Users',
}

const PRIORITIES = ['NORMAL', 'HIGH', 'URGENT'] as const

const MAX_BODY = 500

export function SendNotificationTab() {
  const { apiParam } = useInstitutionId()
  const [target, setTarget] = useState<string>('EVERYONE')
  const [targetValue, setTargetValue] = useState('')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [type, setType] = useState<string>('ANNOUNCEMENT')
  const [priority, setPriority] = useState<string>('NORMAL')
  const [sending, setSending] = useState(false)

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    setSending(true)
    try {
      const res = await fetch(`/api/school/notifications${apiParam}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title, body, type, priority, channel: 'PUSH',
          target, targetValue: target !== 'EVERYONE' ? targetValue : undefined,
        }),
      })
      if (!res.ok) throw new Error('Failed to send')
      toast.success('Notification sent successfully')
      setTitle('')
      setBody('')
      setTargetValue('')
    } catch {
      toast.error('Failed to send notification')
    } finally {
      setSending(false)
    }
  }

  return (
    <Card className="mt-4 p-6">
      <form onSubmit={handleSend} className="space-y-5">
        <div className="space-y-2">
          <label className="text-sm font-medium">Target</label>
          <div className="flex flex-wrap gap-2">
            {TARGETS.map(t => (
              <button
                key={t} type="button" onClick={() => setTarget(t)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors min-h-[44px] ${
                  target === t ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {TARGET_LABELS[t]}
              </button>
            ))}
          </div>
          {target !== 'EVERYONE' && (
            <Input
              placeholder={`Enter ${TARGET_LABELS[target]?.toLowerCase() ?? 'value'}...`}
              value={targetValue} onChange={e => setTargetValue(e.target.value)}
              className="mt-2 min-h-[44px]"
            />
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Title</label>
          <Input value={title} onChange={e => setTitle(e.target.value)}
            required placeholder="Notification title" className="min-h-[44px]" />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Body</label>
            <span className="text-xs text-muted-foreground">{body.length}/{MAX_BODY}</span>
          </div>
          <textarea
            value={body} onChange={e => setBody(e.target.value.slice(0, MAX_BODY))}
            required rows={4} placeholder="Write your message..."
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none min-h-[44px]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Type</label>
            <select value={type} onChange={e => setType(e.target.value)}
              className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[44px]">
              {TYPES.map(t => (
                <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Priority</label>
            <div className="flex gap-2">
              {PRIORITIES.map(p => (
                <button key={p} type="button" onClick={() => setPriority(p)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors min-h-[44px] flex-1 ${
                    priority === p ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={sending} className="min-h-[44px]">
            {sending ? 'Sending...' : 'Send Notification'}
          </Button>
        </div>
      </form>
    </Card>
  )
}
