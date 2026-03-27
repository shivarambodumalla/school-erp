import { Construction } from 'lucide-react'

export default function VibePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Vibe
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          School community feed and announcements
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
            Vibe — Coming Week 9 (May 27)
          </p>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            Share achievements, events, and announcements with the entire school community. Students and parents react.
          </p>
        </div>
      </div>
    </div>
  )
}