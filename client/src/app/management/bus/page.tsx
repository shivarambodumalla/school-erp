import { Construction } from 'lucide-react'

export default function BusTrackingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Bus Tracking
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Real-time GPS tracking for school buses
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
            Bus Tracking — Coming Phase 5 (post-release)
          </p>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            Parents track school bus location in real-time. Automated arrival alerts via WhatsApp.
          </p>
        </div>
      </div>
    </div>
  )
}