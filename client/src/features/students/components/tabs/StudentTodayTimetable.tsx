'use client'

import { Clock, CalendarOff } from 'lucide-react'

interface Slot {
  periodNumber: number
  startTime: string
  endTime: string
  subject: { name: string }
  staff: { firstName: string; lastName: string }
}

interface Props {
  slots: Slot[]
}

function isCurrent(start: string, end: string): boolean {
  const now = new Date()
  const h = now.getHours()
  const m = now.getMinutes()
  const current = h * 60 + m

  const [sh, sm] = start.split(':').map(Number)
  const [eh, em] = end.split(':').map(Number)
  return current >= (sh * 60 + sm) && current <= (eh * 60 + em)
}

export function StudentTodayTimetable({ slots }: Props) {
  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'short',
  })

  return (
    <div className="rounded-xl border bg-card">
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="text-sm font-semibold">Today&apos;s Schedule</h3>
        <span className="text-xs text-muted-foreground">{today}</span>
      </div>

      {slots.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
          <CalendarOff className="h-8 w-8" />
          <p className="text-sm">No classes today</p>
        </div>
      ) : (
        <div className="divide-y">
          {slots.map(slot => {
            const active = isCurrent(slot.startTime, slot.endTime)
            return (
              <div
                key={slot.periodNumber}
                className={`flex items-center gap-3 px-4 py-3 ${
                  active ? 'border-l-2 border-l-primary bg-primary/5' : ''
                }`}
              >
                <span className="flex items-center justify-center h-7 w-7
                  rounded-full bg-muted text-xs font-bold shrink-0">
                  {slot.periodNumber}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {slot.subject.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {slot.staff.firstName} {slot.staff.lastName}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                  <Clock className="h-3 w-3" />
                  {slot.startTime}–{slot.endTime}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
