'use client'

import { useState, useEffect, useCallback } from 'react'
import { useInstitutionId } from '@/hooks/useInstitutionId'
import { toast } from 'sonner'
import { Search, SlidersHorizontal } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Checkbox } from '@/components/ui/checkbox'
import type { LeaveRecord } from './leave-types'
import { LeaveStatsRow } from './LeaveStatsRow'
import { LeaveTable } from './LeaveTable'
import { ApproveLeaveModal } from './ApproveLeaveModal'
import { RejectLeaveModal } from './RejectLeaveModal'

const STATUS_OPTIONS = ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED']

export function LeaveManagementClient() {
  const { apiParam, addParams } = useInstitutionId()
  const [leaves, setLeaves] = useState<LeaveRecord[]>([])
  const [statuses, setStatuses] = useState<string[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [approveTarget, setApproveTarget] = useState<LeaveRecord | null>(null)
  const [rejectTarget, setRejectTarget] = useState<LeaveRecord | null>(null)

  const fetchLeaves = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statuses.length === 1) params.set('status', statuses[0])
      addParams(params)
      const res = await fetch(`/api/school/staff/leaves?${params}`)
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json() as LeaveRecord[]
      setLeaves(data)
    } catch {
      toast.error('Failed to load leave records')
    } finally {
      setLoading(false)
    }
  }, [statuses])

  useEffect(() => { fetchLeaves() }, [fetchLeaves])

  const toggleStatus = (s: string) => {
    setStatuses(prev =>
      prev.includes(s) ? prev.filter(v => v !== s) : [...prev, s],
    )
  }

  const activeFilterCount = statuses.length

  // Client-side search + multi-status filter
  const filtered = leaves.filter(l => {
    const matchesStatus = statuses.length === 0 || statuses.includes(l.status)
    const matchesSearch = search === '' ||
      `${l.staff?.firstName ?? ''} ${l.staff?.lastName ?? ''}`.toLowerCase().includes(search.toLowerCase()) ||
      l.staff?.employeeNo.toLowerCase().includes(search.toLowerCase()) ||
      l.leaveType.name.toLowerCase().includes(search.toLowerCase())
    return matchesStatus && matchesSearch
  })

  async function handleApprove(leaveId: string, staffId: string) {
    const res = await fetch(`/api/school/staff/${staffId}/leaves/${leaveId}${apiParam}`, {
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
    const res = await fetch(`/api/school/staff/${staffId}/leaves/${leaveId}${apiParam}`, {
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
      {/* Toolbar: Title left | Search + Filter right */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight shrink-0">Leave Management</h1>
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search..." value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 w-full sm:w-48" />
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon" className="min-h-[44px] min-w-[44px] relative">
                <SlidersHorizontal className="h-4 w-4" />
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary
                    text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-52 p-0">
              <div className="px-3 py-2.5 border-b">
                <p className="text-sm font-medium">Status</p>
              </div>
              <div className="p-2 space-y-0.5">
                {STATUS_OPTIONS.map(s => (
                  <label key={s}
                    className="flex items-center gap-2.5 px-2 py-2 rounded-md
                      hover:bg-muted/50 cursor-pointer transition-colors">
                    <Checkbox
                      checked={statuses.includes(s)}
                      onCheckedChange={() => toggleStatus(s)}
                    />
                    <span className="text-sm">{s.charAt(0) + s.slice(1).toLowerCase()}</span>
                  </label>
                ))}
              </div>
              {statuses.length > 0 && (
                <div className="px-3 py-2 border-t">
                  <button type="button" onClick={() => setStatuses([])}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                    Clear all
                  </button>
                </div>
              )}
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <LeaveStatsRow leaves={leaves} />

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-14 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      ) : (
        <LeaveTable
          leaves={filtered}
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
