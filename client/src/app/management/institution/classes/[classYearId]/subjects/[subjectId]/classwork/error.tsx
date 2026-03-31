'use client'

export default function ErrorBoundary({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <p className="text-destructive font-medium">Something went wrong</p>
      <p className="text-sm text-muted-foreground">{error.message}</p>
      <button onClick={reset} className="text-sm text-primary hover:underline">
        Try again
      </button>
    </div>
  )
}
