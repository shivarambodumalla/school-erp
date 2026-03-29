'use client'

import { useState } from 'react'
import { useInstitutionId } from '@/hooks/useInstitutionId'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Search } from 'lucide-react'
import { toast } from 'sonner'
import { STATUS_COLORS } from '../../types'
import type { FeePaymentItem } from '../../types'
import { CollectPaymentSheet } from '../CollectPaymentSheet'
import { FeeReceiptModal } from '../FeeReceiptModal'

interface StudentResult { id: string; firstName: string; lastName: string; admissionNo: string }
interface StudentFeeData {
  summary: { totalDue: number; totalPaid: number; totalPending: number; totalOverdue: number }
  payments: FeePaymentItem[]
}

export function FeeCollectTab() {
  const { addParams, apiParam } = useInstitutionId()
  const [search, setSearch] = useState('')
  const [results, setResults] = useState<StudentResult[]>([])
  const [selected, setSelected] = useState<StudentResult | null>(null)
  const [feeData, setFeeData] = useState<StudentFeeData | null>(null)
  const [collectPayment, setCollectPayment] = useState<FeePaymentItem | null>(null)
  const [receipt, setReceipt] = useState<{ receiptNo: string; totalAmount: number } | null>(null)

  const handleSearch = async (q: string) => {
    setSearch(q)
    if (q.length < 2) { setResults([]); return }
    const sp = new URLSearchParams({ search: q })
    addParams(sp)
    const res = await fetch(`/api/school/students?${sp}`)
    if (res.ok) {
      const data = await res.json()
      setResults(data.students ?? data ?? [])
    }
  }

  const selectStudent = async (s: StudentResult) => {
    setSelected(s); setResults([]); setSearch('')
    const res = await fetch(`/api/school/fees/student/${s.id}${apiParam}`)
    if (res.ok) setFeeData(await res.json())
    else toast.error('Failed to load student fees')
  }

  const handleCollected = (data: { receiptNo: string; totalAmount: number }) => {
    setReceipt(data)
    if (selected) selectStudent(selected) // refresh
  }

  const pending = feeData?.payments.filter(p => p.status === 'PENDING' || p.status === 'OVERDUE') ?? []
  const paid = feeData?.payments.filter(p => p.status === 'PAID') ?? []

  return (
    <div className="space-y-6 pt-4">
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search student by name or admission no..."
          value={search} onChange={e => handleSearch(e.target.value)}
          className="pl-9 min-h-[44px]" />
        {results.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-popover border rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
            {results.map(s => (
              <button key={s.id} type="button" onClick={() => selectStudent(s)}
                className="w-full px-4 py-3 text-left hover:bg-muted/50 text-sm flex justify-between">
                <span className="font-medium">{s.firstName} {s.lastName}</span>
                <span className="text-muted-foreground">{s.admissionNo}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {selected && feeData && (
        <>
          <Card className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
              {selected.firstName[0]}{selected.lastName[0]}
            </div>
            <div className="flex-1">
              <p className="font-medium">{selected.firstName} {selected.lastName}</p>
              <p className="text-xs text-muted-foreground">{selected.admissionNo}</p>
            </div>
            <div className="flex gap-3 text-sm">
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">Due ₹{feeData.summary.totalDue.toLocaleString('en-IN')}</Badge>
              <Badge variant="secondary" className="bg-green-100 text-green-700">Paid ₹{feeData.summary.totalPaid.toLocaleString('en-IN')}</Badge>
              <Badge variant="secondary" className="bg-amber-100 text-amber-700">Pending ₹{feeData.summary.totalPending.toLocaleString('en-IN')}</Badge>
            </div>
          </Card>

          {pending.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">Pending Fees</h3>
              <div className="rounded-xl border divide-y">
                {pending.map(p => (
                  <div key={p.id} className="flex items-center justify-between px-4 py-3">
                    <div>
                      <p className="font-medium text-sm">{p.feeCategory?.name}</p>
                      <p className="text-xs text-muted-foreground">Due: {new Date(p.dueDate).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="font-semibold">₹{Number(p.totalAmount).toLocaleString('en-IN')}</p>
                      {p.status === 'OVERDUE' && <Badge className="bg-red-100 text-red-700">Overdue</Badge>}
                      <Button size="sm" className="min-h-[44px]" onClick={() => setCollectPayment(p)}>Collect</Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {paid.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">Payment History</h3>
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
        </>
      )}

      {collectPayment && selected && (
        <CollectPaymentSheet open onClose={() => setCollectPayment(null)}
          payment={collectPayment} studentName={`${selected.firstName} ${selected.lastName}`}
          onCollected={handleCollected} />
      )}

      {receipt && (
        <FeeReceiptModal open onClose={() => setReceipt(null)} receiptNo={receipt.receiptNo} totalAmount={receipt.totalAmount} />
      )}
    </div>
  )
}
