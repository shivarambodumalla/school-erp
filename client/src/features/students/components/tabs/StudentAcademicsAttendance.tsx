'use client'

interface AttendanceData {
  present: number
  absent: number
  late: number
  halfDay: number
  excused: number
  total: number
  pct: number
}

interface Props {
  attendance: AttendanceData
}

export function StudentAcademicsAttendance({ attendance: a }: Props) {
  const radius = 54
  const circumference = 2 * Math.PI * radius
  const presentArc = a.total > 0 ? ((a.present + a.late + a.halfDay) / a.total) * circumference : circumference
  const absentArc = a.total > 0 ? (a.absent / a.total) * circumference : 0

  return (
    <div className="rounded-xl border bg-card p-4 space-y-4">
      <h3 className="text-sm font-semibold">Attendance</h3>

      <div className="flex items-center gap-6">
        {/* CSS ring chart */}
        <div className="relative h-32 w-32 shrink-0">
          <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
            <circle cx="60" cy="60" r={radius} fill="none"
              stroke="currentColor" strokeWidth="10"
              className="text-muted/30" />
            <circle cx="60" cy="60" r={radius} fill="none"
              stroke="currentColor" strokeWidth="10"
              className="text-green-500"
              strokeDasharray={`${presentArc} ${circumference}`}
              strokeLinecap="round" />
            <circle cx="60" cy="60" r={radius} fill="none"
              stroke="currentColor" strokeWidth="10"
              className="text-red-500"
              strokeDasharray={`${absentArc} ${circumference}`}
              strokeDashoffset={`${-presentArc}`}
              strokeLinecap="round" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold">{a.pct}%</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
          <Stat label="Present" value={a.present} color="bg-green-500" />
          <Stat label="Absent" value={a.absent} color="bg-red-500" />
          <Stat label="Late" value={a.late} color="bg-amber-500" />
          <Stat label="Total" value={a.total} color="bg-muted-foreground" />
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`h-2 w-2 rounded-full ${color}`} />
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}
