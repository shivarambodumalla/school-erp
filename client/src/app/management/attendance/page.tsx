import { Construction } from 'lucide-react'

export default function AttendancePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Attendance
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Mark and track daily student attendance
        </p>
      </div>
      <div className="rounded-xl border bg-card p-16 flex flex-col
        items-center justify-center gap-4 text-center">
        <div className="h-14 w-14 rounded-full bg-muted flex
          items-center justify-center">
          <Construction className="h-7 w-7 text-muted-foreground" />
        </div>
        <div>
          <p className="font-semibold">
            Attendance — Coming Week 3 (April 15)
          </p>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            Teachers mark class attendance daily. Admin views monthly summaries, absentee reports, and attendance trends.
          </p>
        </div>
      </div>
    </div>
  )
}