'use client'

import { STAFF_ATTENDANCE_COLORS } from '@/lib/colors'

interface AttendanceRecord {
  date: string
  status: string
  checkInTime: string | null
}

interface Props {
  year: number
  month: number
  records: AttendanceRecord[]
}

export function AttendanceHeatmap({ year, month, records }: Props) {
  const daysInMonth = new Date(year, month, 0).getDate()
  const firstDayOffset = new Date(year, month - 1, 1).getDay()
  const recordMap = new Map(records.map((r) => [r.date, r]))

  return (
    <>
      <div className="grid grid-cols-7 gap-1">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <div key={i} className="text-center text-xs font-medium
            text-muted-foreground py-1">
            {d}
          </div>
        ))}
        {Array.from({ length: firstDayOffset }).map((_, i) => (
          <div key={`e-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1
          const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const rec = recordMap.get(dateStr)
          const bg = rec ? STAFF_ATTENDANCE_COLORS[rec.status] ?? 'bg-muted' : 'bg-muted/50'
          const title = rec
            ? `${rec.status}${rec.checkInTime ? ` | In: ${rec.checkInTime}` : ''}`
            : 'No record'
          return (
            <div
              key={day}
              title={title}
              className={`aspect-square rounded-md flex items-center
                justify-center text-xs font-medium ${bg}
                ${rec ? 'text-white' : 'text-muted-foreground'}`}
            >
              {day}
            </div>
          )
        })}
      </div>

      <div className="flex flex-wrap gap-3 text-xs">
        {Object.entries(STAFF_ATTENDANCE_COLORS).map(([label, color]) => (
          <div key={label} className="flex items-center gap-1">
            <span className={`h-3 w-3 rounded-sm ${color}`} />
            {label.replace('_', ' ')}
          </div>
        ))}
      </div>
    </>
  )
}
