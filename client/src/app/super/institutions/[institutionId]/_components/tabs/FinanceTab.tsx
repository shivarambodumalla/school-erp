'use client'

import { useEffect, useState } from 'react'
import { CreditCard, TrendingUp, AlertCircle, Clock } from 'lucide-react'
import { StatCard } from '@/components/shared/StatCard'
import { PLAN_COLORS } from '@/lib/colors'

interface Payment {
  id: string
  amount: number
  status: string
  createdAt: string
}

interface FinanceData {
  planTier: string
  customPricing: number | null
  totalRevenue: number
  outstandingAmount: number
  lastPaymentDate: string | null
  payments: Payment[]
}

interface Props { institutionId: string; apiBase: string }

export function FinanceTab({ apiBase }: Props) {
  const [data, setData] = useState<FinanceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    fetch(`${apiBase}/finance`, { signal: controller.signal })
      .then(r => r.json())
      .then(d => { setData(d as FinanceData); setLoading(false) })
      .catch(err => {
        if (err instanceof Error && err.name === 'AbortError') return
        setError(true)
        setLoading(false)
      })
    return () => controller.abort()
  }, [apiBase])

  if (loading) return (
    <div className="space-y-4">
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i}
          className="h-28 rounded-xl bg-muted animate-pulse" />
      ))}
    </div>
  )

  if (error || !data) return (
    <div className="rounded-xl border border-red-200 bg-red-50
      p-6 text-center text-red-700 text-sm">
      Failed to load finance data. Please refresh.
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Current Plan" value={data.planTier}
          icon={CreditCard} color="blue" />
        <StatCard
          label="Total Revenue"
          value={`₹${data.totalRevenue.toLocaleString('en-IN')}`}
          icon={TrendingUp} color="green" />
        <StatCard
          label="Outstanding"
          value={`₹${data.outstandingAmount.toLocaleString('en-IN')}`}
          icon={AlertCircle}
          color={data.outstandingAmount > 0 ? 'red' : 'green'} />
        <StatCard
          label="Last Payment"
          value={data.lastPaymentDate
            ? new Date(data.lastPaymentDate)
              .toLocaleDateString('en-IN')
            : 'None'
          }
          icon={Clock} color="amber" />
      </div>

      <div className="rounded-xl border bg-card p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Current Plan</h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              {data.customPricing
                ? `Custom: ₹${data.customPricing}/month`
                : 'Standard pricing'
              }
            </p>
          </div>
          <span className={`inline-flex items-center px-3 py-1.5
            rounded-full text-sm font-medium
            ${PLAN_COLORS[data.planTier] ??
              'bg-gray-100 text-gray-600'}`}>
            {data.planTier}
          </span>
        </div>
      </div>

      <div className="rounded-xl border bg-card">
        <div className="p-4 border-b">
          <h3 className="font-semibold">Payment History</h3>
        </div>
        {data.payments.length === 0 ? (
          <div className="flex flex-col items-center justify-center
            py-12 gap-2">
            <CreditCard className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              No payment records yet
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {data.payments.map(p => (
              <div key={p.id}
                className="flex items-center justify-between
                  px-4 py-3">
                <div>
                  <p className="text-sm font-medium">
                    ₹{p.amount.toLocaleString('en-IN')}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(p.createdAt)
                      .toLocaleDateString('en-IN')}
                  </p>
                </div>
                <span className={`inline-flex items-center
                  px-2 py-0.5 rounded-full text-xs font-medium
                  ${p.status === 'PAID'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-amber-100 text-amber-700'
                  }`}>
                  {p.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
