'use client'

import { useState } from 'react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import type { LeaveRecord } from './leave-types'

interface Props {
  leave: LeaveRecord | null
  open: boolean
  onClose: () => void
  onConfirm: (leaveId: string, staffId: string) => Promise<void>
}

export function ApproveLeaveModal({ leave, open, onClose, onConfirm }: Props) {
  const [loading, setLoading] = useState(false)

  if (!leave) return null

  async function handleConfirm() {
    if (!leave) return
    setLoading(true)
    try {
      await onConfirm(leave.id, leave.staffId)
      onClose()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Approve Leave</DialogTitle>
          <DialogDescription>
            Confirm approval for {leave.staff?.firstName} {leave.staff?.lastName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 text-sm">
          <p><span className="font-medium">Type:</span> {leave.leaveType.name}</p>
          <p>
            <span className="font-medium">Period:</span>{' '}
            {format(new Date(leave.fromDate), 'dd MMM yyyy')} -{' '}
            {format(new Date(leave.toDate), 'dd MMM yyyy')} ({leave.totalDays} days)
          </p>
          <p><span className="font-medium">Reason:</span> {leave.reason}</p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            className="bg-green-600 hover:bg-green-700"
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? 'Approving...' : 'Approve'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
