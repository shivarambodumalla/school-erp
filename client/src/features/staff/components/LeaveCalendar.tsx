'use client'

import { useState, useMemo } from 'react'
import {
  startOfMonth, endOfMonth, eachDayOfInterval,
  format, getDay, addMonths, subMonths, isSameMonth,
} from 'date-fns'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { LeaveRecord } from './leave-types'

interface Props {
  leaves: LeaveRecord[]
}

const DEPT_COLORS: Record<string, string> = {
  Science: 'bg-blue-200 text-blue-800',
  Mathematics: 'bg-violet-200 text-violet-800',
  English: 'bg-emerald-200 text-emerald-800',
  Social: 'bg-amber-200 text-amber-800',
  Admin: 'bg-red-200 text-red-800',
}

function getDeptColor(dept: string | undefined): string {
  if (!dept) return 'bg-gray-200 text-gray-700'
  return DEPT_COLORS[dept] ?? 'bg-gray-200 text-gray-700'
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function LeaveCalendar({ leaves }: Props) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const approvedLeaves = useMemo(
    () => leaves.filter(l => l.status === 'APPROVED'),
    [leaves],
  )

  const days = useMemo(() => {
    const start = startOfMonth(currentMonth)
    const end = endOfMonth(currentMonth)
    return eachDayOfInterval({ start, end })
  }, [currentMonth])

  const startPad = getDay(days[0])

  function getLeavesForDay(day: Date): LeaveRecord[] {
    const dayStr = format(day, 'yyyy-MM-dd')
    return approvedLeaves.filter(l => {
      const from = l.fromDate.slice(0, 10)
      const to = l.toDate.slice(0, 10)
      return from <= dayStr && to >= dayStr
    })
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="outline" size="sm"
          className="min-h-[44px]"
          onClick={() => setCurrentMonth(m => subMonths(m, 1))}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h3 className="font-semibold">
          {format(currentMonth, 'MMMM yyyy')}
        </h3>
        <Button
          variant="outline" size="sm"
          className="min-h-[44px]"
          onClick={() => setCurrentMonth(m => addMonths(m, 1))}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-px">
        {WEEKDAYS.map(w => (
          <div key={w} className="text-center text-xs font-medium text-muted-foreground p-2">
            {w}
          </div>
        ))}

        {Array.from({ length: startPad }).map((_, i) => (
          <div key={`pad-${i}`} className="min-h-[80px] p-1" />
        ))}

        {days.map(day => {
          const dayLeaves = getLeavesForDay(day)
          const isCurrentMonth = isSameMonth(day, currentMonth)
          return (
            <div
              key={day.toISOString()}
              className={`min-h-[80px] border rounded p-1 ${
                isCurrentMonth ? 'bg-background' : 'bg-muted/30'
              } ${day.getDay() === 0 ? 'bg-red-50' : ''}`}
            >
              <span className="text-xs font-medium">{format(day, 'd')}</span>
              <div className="space-y-0.5 mt-0.5">
                {dayLeaves.slice(0, 3).map(l => (
                  <div
                    key={l.id}
                    className={`text-[10px] leading-tight px-1 rounded truncate ${
                      getDeptColor(l.staff?.department?.name)
                    }`}
                  >
                    {l.staff?.firstName} {l.staff?.lastName?.charAt(0)}.
                  </div>
                ))}
                {dayLeaves.length > 3 && (
                  <span className="text-[10px] text-muted-foreground">
                    +{dayLeaves.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
