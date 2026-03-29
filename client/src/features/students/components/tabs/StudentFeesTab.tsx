'use client'

import { useState, useEffect, useCallback } from 'react'
import { useInstitutionId } from '@/hooks/useInstitutionId'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { STATUS_COLORS } from '@/features/fees/types'
import type { FeePaymentItem } from '@/features/fees/types'

interface Props {
  studentId: string
}

interface FeeData {
  summary: { totalDue: number; totalPaid: number; totalPending: number; totalOverdue: number }
  payments: FeePaymentItem[]
  concessions: { id: string; name: string; type: string; amount: string }[]
}

export function StudentFeesTab({ studentId }: Props) {
  const { apiParam } = useInstitutionId()
  const [data, setData] = useState<FeeData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setLoading(true)
    const res = await fetch(`/api/school/fees/student/${studentId}${apiParam}`)
    if (res.ok) setData(await res.json())
    setLoading(false)
  }, [studentId, apiParam])

  useEffect(() => { fetchData() }, [fetchData])

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (!data) return <p className="text-sm text-muted-foreground py-8 text-center">Failed to load fee data</p>

  const pending = data.payments.filter(p => p.status === 'PENDING' || p.status === 'OVERDUE')
  const paid = data.payments.filter(p => p.status === 'PAID')

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4"><p className="text-xs text-muted-foreground">Total Due</p><p className="text-xl font-bold text-blue-600">₹{data.summary.totalDue.toLocaleString('en-IN')}</p></Card>
        <Card className="p-4"><p className="text-xs text-muted-foreground">Paid</p><p className="text-xl font-bold text-green-600">₹{data.summary.totalPaid.toLocaleString('en-IN')}</p></Card>
        <Card className="p-4"><p className="text-xs text-muted-foreground">Pending</p><p className="text-xl font-bold text-amber-600">₹{data.summary.totalPending.toLocaleString('en-IN')}</p></Card>
        <Card className="p-4"><p className="text-xs text-muted-foreground">Overdue</p><p className="text-xl font-bold text-red-600">₹{data.summary.totalOverdue.toLocaleString('en-IN')}</p></Card>
      </div>

      {/* Concessions */}
      {data.concessions.length > 0 && (
        <div>
          <h3 className="font-semibold text-sm mb-2">Active Concessions</h3>
          <div className="flex flex-wrap gap-2">
            {data.concessions.map(c => (
              <Badge key={c.id} variant="secondary" className="bg-green-100 text-green-700">
                {c.name}: {c.type === 'PERCENTAGE' ? `${Number(c.amount)}%` : `₹${Number(c.amount).toLocaleString('en-IN')}`}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Pending */}
      {pending.length > 0 && (
        <div>
          <h3 className="font-semibold text-sm mb-2">Pending Fees</h3>
          <div className="rounded-xl border divide-y">
            {pending.map(p => (
              <div key={p.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="font-medium text-sm">{p.feeCategory?.name}</p>
                  <p className="text-xs text-muted-foreground">Due: {new Date(p.dueDate).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold">₹{Number(p.totalAmount).toLocaleString('en-IN')}</p>
                  <Badge variant="secondary" className={STATUS_COLORS[p.status] ?? ''}>{p.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* History */}
      {paid.length > 0 && (
        <div>
          <h3 className="font-semibold text-sm mb-2">Payment History</h3>
          <div className="rounded-xl border overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50"><tr className="border-b">
                <th className="text-left px-4 py-3 font-medium">Date</th>
                <th className="text-left px-4 py-3 font-medium">Category</th>
                <th className="text-right px-4 py-3 font-medium">Amount</th>
                <th className="text-left px-4 py-3 font-medium">Receipt</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
              </tr></thead>
              <tbody>
                {paid.map(p => (
                  <tr key={p.id} className="border-b last:border-0">
                    <td className="px-4 py-3">{p.paidAt ? new Date(p.paidAt).toLocaleDateString() : '-'}</td>
                    <td className="px-4 py-3 text-muted-foreground">{p.feeCategory?.name}</td>
                    <td className="px-4 py-3 text-right">₹{Number(p.totalAmount).toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 font-mono text-xs">{p.receiptNo ?? '-'}</td>
                    <td className="px-4 py-3"><Badge variant="secondary" className={STATUS_COLORS[p.status] ?? ''}>{p.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
