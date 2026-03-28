'use client'

import { useState, useEffect, useCallback } from 'react'
import { format } from 'date-fns'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from '@/components/ui/table'
import type { LeaveRecord, LeaveBalance } from '../leave-types'
import { STATUS_COLORS } from '../leave-types'
import { LeaveBalanceCards } from '../LeaveBalanceCards'
import { ApplyLeaveSheet } from '../ApplyLeaveSheet'

interface Props {
  staffId: string
  isOwnProfile: boolean
}

export function StaffLeaveTab({ staffId, isOwnProfile }: Props) {
  const [balances, setBalances] = useState<LeaveBalance[]>([])
  const [leaves, setLeaves] = useState<LeaveRecord[]>([])
  const [sheetOpen, setSheetOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [balRes, leavesRes] = await Promise.all([
        fetch(`/api/school/staff/leaves/balance?staffId=${staffId}`),
        fetch(`/api/school/staff/${staffId}/leaves`),
      ])
      if (balRes.ok) setBalances(await balRes.json() as LeaveBalance[])
      if (leavesRes.ok) setLeaves(await leavesRes.json() as LeaveRecord[])
    } catch {
      toast.error('Failed to load leave data')
    } finally {
      setLoading(false)
    }
  }, [staffId])

  useEffect(() => { fetchData() }, [fetchData])

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-20 rounded-lg bg-muted animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Leave Balance</h3>
        {isOwnProfile && (
          <Button size="sm" className="min-h-[44px]" onClick={() => setSheetOpen(true)}>
            <Plus className="h-4 w-4 mr-1" /> Apply for Leave
          </Button>
        )}
      </div>

      <LeaveBalanceCards balances={balances} />

      <h3 className="font-semibold">Leave History</h3>
      {leaves.length === 0 ? (
        <p className="text-sm text-muted-foreground">No leave records yet.</p>
      ) : (
        <div className="border rounded-xl overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>From</TableHead>
                <TableHead>To</TableHead>
                <TableHead className="text-center">Days</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Applied</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaves.map(l => (
                <TableRow key={l.id}>
                  <TableCell>{l.leaveType.name}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    {format(new Date(l.fromDate), 'dd MMM yyyy')}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {format(new Date(l.toDate), 'dd MMM yyyy')}
                  </TableCell>
                  <TableCell className="text-center">{l.totalDays}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={STATUS_COLORS[l.status]}>
                      {l.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {format(new Date(l.appliedAt), 'dd MMM yyyy')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <ApplyLeaveSheet
        staffId={staffId}
        balances={balances}
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onSuccess={fetchData}
      />
    </div>
  )
}
