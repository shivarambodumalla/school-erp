'use client'

import { Banknote, Users, CheckCircle, AlertCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface Props {
  totalStaff: number
  processedCount: number
  pendingCount: number
  totalPayout: number
}

export function PayrollSummaryCards({
  totalStaff, processedCount, pendingCount, totalPayout,
}: Props) {
  const cards = [
    { label: 'Total Staff', value: totalStaff, icon: Users, color: 'text-blue-600' },
    { label: 'Processed', value: processedCount, icon: CheckCircle, color: 'text-green-600' },
    { label: 'Pending', value: pendingCount, icon: AlertCircle, color: 'text-amber-600' },
    {
      label: 'Total Payout',
      value: `₹${totalPayout.toLocaleString('en-IN')}`,
      icon: Banknote,
      color: 'text-primary',
    },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {cards.map((c) => (
        <Card key={c.label}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <c.icon className={`h-4 w-4 ${c.color}`} />
              <span className="text-xs text-muted-foreground">{c.label}</span>
            </div>
            <p className="text-xl font-bold mt-1">{c.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
