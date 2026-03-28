'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import type { LeaveRecord, StatusFilter } from './leave-types'
import { LeaveStatsRow } from './LeaveStatsRow'
import { LeaveFilters } from './LeaveFilters'
import { LeaveTable } from './LeaveTable'
import { ApproveLeaveModal } from './ApproveLeaveModal'
import { RejectLeaveModal } from './RejectLeaveModal'

export function LeaveManagementClient() {
  const [leaves, setLeaves] = useState<LeaveRecord[]>([])
  const [status, setStatus] = useState<StatusFilter>('ALL')
  const [loading, setLoading] = useState(true)
  const [approveTarget, setApproveTarget] = useState<LeaveRecord | null>(null)
  const [rejectTarget, setRejectTarget] = useState<LeaveRecord | null>(null)

  const fetchLeaves = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (status !== 'ALL') params.set('status', status)
      const res = await fetch(`/api/school/staff/leaves?${params}`)
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json() as LeaveRecord[]
      setLeaves(data)
    } catch {
      toast.error('Failed to load leave records')
    } finally {
      setLoading(false)
    }
  }, [status])

  useEffect(() => { fetchLeaves() }, [fetchLeaves])

  async function handleApprove(leaveId: string, staffId: string) {
    const res = await fetch(`/api/school/staff/${staffId}/leaves/${leaveId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'APPROVED' }),
    })
    if (!res.ok) {
      const err = await res.json() as { error: string }
      toast.error(err.error ?? 'Failed to approve')
      return
    }
    toast.success('Leave approved')
    fetchLeaves()
  }

  async function handleReject(leaveId: string, staffId: string, comment: string) {
    const res = await fetch(`/api/school/staff/${staffId}/leaves/${leaveId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'REJECTED', approvalComment: comment }),
    })
    if (!res.ok) {
      const err = await res.json() as { error: string }
      toast.error(err.error ?? 'Failed to reject')
      return
    }
    toast.success('Leave rejected')
    fetchLeaves()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Leave Management</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Review and manage staff leave requests
        </p>
      </div>

      <LeaveStatsRow leaves={leaves} />
      <LeaveFilters status={status} onStatusChange={setStatus} />

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-14 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      ) : (
        <LeaveTable
          leaves={leaves}
          onApprove={setApproveTarget}
          onReject={setRejectTarget}
        />
      )}

      <ApproveLeaveModal
        leave={approveTarget}
        open={!!approveTarget}
        onClose={() => setApproveTarget(null)}
        onConfirm={handleApprove}
      />

      <RejectLeaveModal
        leave={rejectTarget}
        open={!!rejectTarget}
        onClose={() => setRejectTarget(null)}
        onConfirm={handleReject}
      />
    </div>
  )
}
