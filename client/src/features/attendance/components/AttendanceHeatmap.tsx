'use client'

import { useCallback, useEffect, useState } from 'react'
import type { HeatmapDay } from '../types'

interface Props {
  studentId: string
  month: number
  year: number
}

const STATUS_COLORS: Record<string, string> = {
  PRESENT: 'bg-green-500',
  ABSENT: 'bg-red-500',
  LATE: 'bg-amber-500',
  HALF_DAY: 'bg-blue-500',
  EXCUSED: 'bg-gray-400',
}

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export function AttendanceHeatmap({ studentId, month, year }: Props) {
  const [days, setDays] = useState<HeatmapDay[]>([])

  const fetchData = useCallback(async () => {
    const params = new URLSearchParams({
      studentId,
      month: String(month),
      year: String(year),
    })
    const res = await fetch(
      `/api/school/attendance/summary?${params}`,
    )
    if (res.ok) {
      const data = await res.json()
      setDays(data.days ?? [])
    }
  }, [studentId, month, year])

  useEffect(() => { fetchData() }, [fetchData])

  const dayMap = new Map(days.map((d) => [d.date, d.status]))
  const firstDay = new Date(year, month - 1, 1)
  const lastDay = new Date(year, month, 0)
  const startDow = (firstDay.getDay() + 6) % 7

  const cells: (string | null)[] = Array(startDow).fill(null)
  for (let d = 1; d <= lastDay.getDate(); d++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${
      String(d).padStart(2, '0')
    }`
    cells.push(dateStr)
  }

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-7 gap-1 text-xs
        text-muted-foreground">
        {DAY_LABELS.map((d) => (
          <div key={d} className="text-center py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((dateStr, i) => {
          if (!dateStr) {
            return <div key={`empty-${i}`} className="h-8" />
          }
          const status = dayMap.get(dateStr)
          const bg = status ? STATUS_COLORS[status] : 'bg-muted'
          const dayNum = new Date(dateStr).getDate()
          return (
            <div
              key={dateStr}
              className={`h-8 rounded flex items-center
                justify-center text-xs font-medium ${bg} ${
                status ? 'text-white' : 'text-muted-foreground'
              }`}
              title={`${dateStr}: ${status ?? 'No data'}`}
            >
              {dayNum}
            </div>
          )
        })}
      </div>
      <div className="flex gap-3 text-xs flex-wrap">
        {Object.entries(STATUS_COLORS).map(([s, c]) => (
          <div key={s} className="flex items-center gap-1">
            <div className={`w-3 h-3 rounded ${c}`} />
            <span className="capitalize">{s.toLowerCase()}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
