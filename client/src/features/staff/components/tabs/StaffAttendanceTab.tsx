'use client'

import { useEffect, useState, useCallback } from 'react'
import { CalendarCheck, CalendarX, Clock, Palmtree } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { AttendanceHeatmap } from '../AttendanceHeatmap'

interface AttendanceRecord {
  id: string
  date: string
  status: string
  checkInTime: string | null
  checkOutTime: string | null
  notes: string | null
}

interface Summary {
  present: number
  absent: number
  halfDay: number
  onLeave: number
  late: number
  total: number
  pct: number
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

export function StaffAttendanceTab({ staffId }: { staffId: string }) {
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(
        `/api/school/staff/${staffId}/attendance?month=${month}&year=${year}`,
      )
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setRecords(data.records)
      setSummary(data.summary)
    } catch {
      setRecords([])
      setSummary(null)
    } finally {
      setLoading(false)
    }
  }, [staffId, month, year])

  useEffect(() => { fetchData() }, [fetchData])

  const cards = [
    { label: 'Present', value: summary?.present ?? 0, icon: CalendarCheck, color: 'text-green-600' },
    { label: 'Absent', value: summary?.absent ?? 0, icon: CalendarX, color: 'text-red-600' },
    { label: 'Half Day', value: summary?.halfDay ?? 0, icon: Clock, color: 'text-amber-600' },
    { label: 'On Leave', value: summary?.onLeave ?? 0, icon: Palmtree, color: 'text-blue-600' },
    { label: 'Total Days', value: summary?.total ?? 0, icon: CalendarCheck, color: 'text-muted-foreground' },
    { label: 'Attendance %', value: `${summary?.pct ?? 0}%`, icon: CalendarCheck, color: 'text-primary' },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Select value={String(month)} onValueChange={(v) => setMonth(Number(v))}>
          <SelectTrigger className="w-36 min-h-[44px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            {MONTHS.map((m, i) => (
              <SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
          <SelectTrigger className="w-24 min-h-[44px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            {[year - 1, year, year + 1].map((y) => (
              <SelectItem key={y} value={String(y)}>{y}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {cards.map((c) => (
              <Card key={c.label}>
                <CardContent className="p-3 text-center">
                  <c.icon className={`h-4 w-4 mx-auto mb-1 ${c.color}`} />
                  <p className="text-lg font-bold">{c.value}</p>
                  <p className="text-xs text-muted-foreground">{c.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <AttendanceHeatmap year={year} month={month} records={records} />
        </>
      )}
    </div>
  )
}
