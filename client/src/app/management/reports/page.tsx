import { Construction } from 'lucide-react'

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Reports
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Generate attendance, fee, and student reports
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
            Reports — Coming Week 10 (June 3)
          </p>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            Generate printable reports for attendance by class, fee collection summaries, and student enrollment stats.
          </p>
        </div>
      </div>
    </div>
  )
}