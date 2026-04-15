import { FileText } from 'lucide-react'

export default function ReportCardsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Report Cards</h1>
      <div className="rounded-xl border bg-card flex flex-col items-center justify-center py-16 gap-3">
        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
          <FileText className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="font-medium">No report cards yet</p>
        <p className="text-sm text-muted-foreground text-center px-4">
          Report cards will appear here once they are published by your school
        </p>
      </div>
    </div>
  )
}
