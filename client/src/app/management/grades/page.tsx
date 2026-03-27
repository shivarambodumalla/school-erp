import { Construction } from 'lucide-react'

export default function GradesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Grades
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Enter and view student exam results
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
            Grades — Coming Week 4 (April 22)
          </p>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            Enter marks for exams, auto-calculate grade letters, view class rankings and student performance reports.
          </p>
        </div>
      </div>
    </div>
  )
}