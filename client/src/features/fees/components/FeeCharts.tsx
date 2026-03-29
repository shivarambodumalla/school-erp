'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface Props {
  chartData: { month: string; collected: number; pending: number; overdue: number }[]
  byCategory: { categoryName: string; due: number; collected: number; pct: number }[]
}

export function FeeCharts({ chartData, byCategory }: Props) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Bar chart - monthly trend */}
      <div className="rounded-xl border p-4">
        <h3 className="font-semibold text-sm mb-4">Monthly Collection Trend</h3>
        {chartData.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No data</p>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartData}>
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v) => `₹${Number(v).toLocaleString('en-IN')}`} />
              <Legend />
              <Bar dataKey="collected" fill="#22c55e" name="Collected" radius={[4, 4, 0, 0]} />
              <Bar dataKey="pending" fill="#f59e0b" name="Pending" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Category breakdown */}
      <div className="rounded-xl border p-4">
        <h3 className="font-semibold text-sm mb-4">Collection by Category</h3>
        {byCategory.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No data</p>
        ) : (
          <div className="space-y-4">
            {byCategory.map(c => (
              <div key={c.categoryName} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{c.categoryName}</span>
                  <span className="text-muted-foreground">{c.pct}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      c.pct >= 80 ? 'bg-green-500' : c.pct >= 60 ? 'bg-amber-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${c.pct}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>₹{c.collected.toLocaleString('en-IN')} collected</span>
                  <span>₹{c.due.toLocaleString('en-IN')} due</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}