'use client'

import { useState } from 'react'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import type { LeaveBalance } from './leave-types'

interface Props {
  staffId: string
  balances: LeaveBalance[]
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function ApplyLeaveSheet({ staffId, balances, open, onClose, onSuccess }: Props) {
  const [leaveTypeId, setLeaveTypeId] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)

  function reset() {
    setLeaveTypeId('')
    setFromDate('')
    setToDate('')
    setReason('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!leaveTypeId || !fromDate || !toDate || !reason.trim()) return

    setLoading(true)
    try {
      const res = await fetch(`/api/school/staff/${staffId}/leaves`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leaveTypeId, fromDate, toDate, reason }),
      })
      if (!res.ok) {
        const err = await res.json() as { error: string }
        toast.error(err.error ?? 'Failed to apply leave')
        return
      }
      toast.success('Leave application submitted')
      reset()
      onClose()
      onSuccess()
    } catch {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={v => { if (!v) { reset(); onClose() } }}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Apply for Leave</SheetTitle>
          <SheetDescription>Submit a new leave request</SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          <div className="space-y-2">
            <Label>Leave Type</Label>
            <select
              className="w-full min-h-[44px] rounded-md border px-3 text-sm"
              value={leaveTypeId}
              onChange={e => setLeaveTypeId(e.target.value)}
              required
            >
              <option value="">Select type...</option>
              {balances.map(b => (
                <option key={b.leaveTypeId} value={b.leaveTypeId}>
                  {b.name} ({b.remaining}/{b.total} remaining)
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>From Date</Label>
              <Input
                type="date"
                value={fromDate}
                onChange={e => setFromDate(e.target.value)}
                className="min-h-[44px]"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>To Date</Label>
              <Input
                type="date"
                value={toDate}
                onChange={e => setToDate(e.target.value)}
                className="min-h-[44px]"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Reason</Label>
            <Textarea
              placeholder="Reason for leave..."
              value={reason}
              onChange={e => setReason(e.target.value)}
              rows={3}
              required
            />
          </div>

          <Button type="submit" className="w-full min-h-[44px]" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Application'}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  )
}
