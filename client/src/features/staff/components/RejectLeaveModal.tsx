'use client'

import { useState } from 'react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { format } from 'date-fns'
import type { LeaveRecord } from './leave-types'

interface Props {
  leave: LeaveRecord | null
  open: boolean
  onClose: () => void
  onConfirm: (leaveId: string, staffId: string, comment: string) => Promise<void>
}

export function RejectLeaveModal({ leave, open, onClose, onConfirm }: Props) {
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)

  if (!leave) return null

  async function handleConfirm() {
    if (!leave || !comment.trim()) return
    setLoading(true)
    try {
      await onConfirm(leave.id, leave.staffId, comment)
      setComment('')
      onClose()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) { setComment(''); onClose() } }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reject Leave</DialogTitle>
          <DialogDescription>
            Reject leave for {leave.staff?.firstName} {leave.staff?.lastName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 text-sm">
          <p><span className="font-medium">Type:</span> {leave.leaveType.name}</p>
          <p>
            <span className="font-medium">Period:</span>{' '}
            {format(new Date(leave.fromDate), 'dd MMM yyyy')} -{' '}
            {format(new Date(leave.toDate), 'dd MMM yyyy')} ({leave.totalDays} days)
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="reject-comment">Reason for rejection *</Label>
          <Textarea
            id="reject-comment"
            placeholder="Enter reason for rejection..."
            value={comment}
            onChange={e => setComment(e.target.value)}
            rows={3}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => { setComment(''); onClose() }} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={loading || !comment.trim()}
          >
            {loading ? 'Rejecting...' : 'Reject'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
