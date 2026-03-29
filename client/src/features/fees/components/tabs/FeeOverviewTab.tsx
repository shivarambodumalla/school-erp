'use client'

import { useState, useEffect, useCallback } from 'react'
import { useInstitutionId } from '@/hooks/useInstitutionId'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Download, Zap } from 'lucide-react'
import { toast } from 'sonner'
import type { FeeSummary, FeePaymentItem } from '../../types'
import { STATUS_COLORS } from '../../types'
import { GenerateFeesSheet } from '../GenerateFeesSheet'
import { FeeCharts } from '../FeeCharts'

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

export function FeeOverviewTab() {
  const { addParams } = useInstitutionId()
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())
  const [summary, setSummary] = useState<FeeSummary | null>(null)
  const [payments, setPayments] = useState<FeePaymentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [genOpen, setGenOpen] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const sp = new URLSearchParams({ month: String(month), year: String(year) })
      addParams(sp)
      const [sRes, pRes] = await Promise.all([
        fetch(`/api/school/fees/summary?${sp}`),
        fetch(`/api/school/fees/payments?${sp}&page=1`),
      ])
      if (sRes.ok) setSummary(await sRes.json())
      if (pRes.ok) { const d = await pRes.json(); setPayments(d.payments ?? []) }
    } catch { toast.error('Failed to load fee data') }
    setLoading(false)
  }, [month, year, addParams])

  useEffect(() => { fetchData() }, [fetchData])

  if (loading || !summary) {
    return (
      <div className="space-y-4 pt-4">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pt-4">
      <div className="flex flex-wrap items-center gap-3">
        <Select value={String(month)} onValueChange={v => setMonth(Number(v))}>
          <SelectTrigger className="w-36 min-h-[44px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            {MONTHS.map((m, i) => <SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={String(year)} onValueChange={v => setYear(Number(v))}>
          <SelectTrigger className="w-24 min-h-[44px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            {[year - 1, year, year + 1].map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button variant="outline" className="min-h-[44px] ml-auto gap-2" onClick={() => setGenOpen(true)}>
          <Zap className="h-4 w-4" /> Generate Fees
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <StatCard label="Total Due" value={summary.totalDue} color="text-blue-600" />
        <StatCard label="Collected" value={summary.totalCollected} color="text-green-600" />
        <StatCard label="Pending" value={summary.totalPending} color="text-amber-600" />
        <StatCard label="Overdue" value={summary.totalOverdue} color="text-red-600" />
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Collection Rate</p>
          <p className="text-2xl font-bold text-primary">{summary.collectionRate}%</p>
        </Card>
      </div>

      <FeeCharts chartData={summary.chartData} byCategory={summary.byCategory} />

      {/* Recent payments */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Recent Payments</h3>
          <Button variant="ghost" size="sm" className="gap-1.5 min-h-[44px]">
            <Download className="h-4 w-4" /> Export CSV
          </Button>
        </div>
        {payments.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">No payments yet</p>
        ) : (
          <div className="rounded-xl border overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr className="border-b">
                  <th className="text-left px-4 py-3 font-medium">Student</th>
                  <th className="text-left px-4 py-3 font-medium">Category</th>
                  <th className="text-right px-4 py-3 font-medium">Amount</th>
                  <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Method</th>
                  <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Receipt</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.slice(0, 20).map(p => (
                  <tr key={p.id} className="border-b last:border-0">
                    <td className="px-4 py-3 font-medium">
                      {p.student ? `${p.student.firstName} ${p.student.lastName}` : '-'}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{p.feeCategory?.name}</td>
                    <td className="px-4 py-3 text-right">₹{Number(p.totalAmount).toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{p.method ?? '-'}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell font-mono text-xs">{p.receiptNo ?? '-'}</td>
                    <td className="px-4 py-3">
                      <Badge variant="secondary" className={STATUS_COLORS[p.status] ?? ''}>{p.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <GenerateFeesSheet open={genOpen} onClose={() => setGenOpen(false)} onGenerated={fetchData} />
    </div>
  )
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <Card className="p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>₹{value.toLocaleString('en-IN')}</p>
    </Card>
  )
}
