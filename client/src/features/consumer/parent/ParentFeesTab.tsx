'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'

interface ChildFeeData {
  childId: string
  childName: string
  admissionNo: string
  summary: { totalDue: number; totalPaid: number; totalPending: number }
  pendingPayments: { id: string; feeCategory: { name: string }; totalAmount: string; dueDate: string; status: string }[]
  recentPayments: { id: string; feeCategory: { name: string }; totalAmount: string; paidAt: string; receiptNo: string | null }[]
}

export function ParentFeesTab() {
  const [children, setChildren] = useState<ChildFeeData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/consumer/parent/fees')
        if (res.ok) setChildren(await res.json())
      } catch { toast.error('Failed to load fees') }
      setLoading(false)
    })()
  }, [])

  if (loading) {
    return <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />)}
    </div>
  }

  if (children.length === 0) {
    return <p className="text-sm text-muted-foreground py-8 text-center">No fee data available</p>
  }

  if (children.length === 1) return <ChildFees child={children[0]} />

  return (
    <Tabs defaultValue={children[0].childId}>
      <TabsList className="w-full justify-start">
        {children.map(c => (
          <TabsTrigger key={c.childId} value={c.childId}>{c.childName}</TabsTrigger>
        ))}
      </TabsList>
      {children.map(c => (
        <TabsContent key={c.childId} value={c.childId}>
          <ChildFees child={c} />
        </TabsContent>
      ))}
    </Tabs>
  )
}

function ChildFees({ child }: { child: ChildFeeData }) {
  return (
    <div className="space-y-6 pt-4">
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4"><p className="text-xs text-muted-foreground">Total Due</p><p className="text-xl font-bold text-blue-600">₹{child.summary.totalDue.toLocaleString('en-IN')}</p></Card>
        <Card className="p-4"><p className="text-xs text-muted-foreground">Paid</p><p className="text-xl font-bold text-green-600">₹{child.summary.totalPaid.toLocaleString('en-IN')}</p></Card>
        <Card className="p-4"><p className="text-xs text-muted-foreground">Pending</p><p className="text-xl font-bold text-amber-600">₹{child.summary.totalPending.toLocaleString('en-IN')}</p></Card>
      </div>

      {child.pendingPayments.length > 0 && (
        <div>
          <h3 className="font-semibold text-sm mb-2">Pending Fees</h3>
          <div className="rounded-xl border divide-y">
            {child.pendingPayments.map(p => (
              <div key={p.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="font-medium text-sm">{p.feeCategory.name}</p>
                  <p className="text-xs text-muted-foreground">Due: {new Date(p.dueDate).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold">₹{Number(p.totalAmount).toLocaleString('en-IN')}</p>
                  {p.status === 'OVERDUE' && <Badge className="bg-red-100 text-red-700">Overdue</Badge>}
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">Please contact the school office for payment.</p>
        </div>
      )}

      {child.recentPayments.length > 0 && (
        <div>
          <h3 className="font-semibold text-sm mb-2">Recent Payments</h3>
          <div className="rounded-xl border overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50"><tr className="border-b">
                <th className="text-left px-4 py-3 font-medium">Date</th>
                <th className="text-left px-4 py-3 font-medium">Category</th>
                <th className="text-right px-4 py-3 font-medium">Amount</th>
                <th className="text-left px-4 py-3 font-medium">Receipt</th>
              </tr></thead>
              <tbody>
                {child.recentPayments.map(p => (
                  <tr key={p.id} className="border-b last:border-0">
                    <td className="px-4 py-3">{new Date(p.paidAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-muted-foreground">{p.feeCategory.name}</td>
                    <td className="px-4 py-3 text-right">₹{Number(p.totalAmount).toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 font-mono text-xs">{p.receiptNo ?? '-'}</td>
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
