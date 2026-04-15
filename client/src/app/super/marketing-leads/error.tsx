'use client'

import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}): JSX.Element {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center p-6 text-center">
      <AlertTriangle className="h-8 w-8 text-destructive" />
      <p className="mt-4 text-sm font-semibold">Something went wrong.</p>
      <p className="mt-1 max-w-md text-xs text-muted-foreground">{error.message}</p>
      <Button variant="secondary" className="mt-6 rounded-xl" onClick={reset}>
        Try again
      </Button>
    </div>
  )
}
