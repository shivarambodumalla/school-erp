'use client'

import { useEffect, useState } from 'react'
import { Clock } from 'lucide-react'

interface QuizTimerProps {
  minutes: number
  onExpire: () => void
}

export function QuizTimer({ minutes, onExpire }: QuizTimerProps) {
  const [seconds, setSeconds] = useState(minutes * 60)

  useEffect(() => {
    if (seconds <= 0) {
      onExpire()
      return
    }
    const timer = setTimeout(() => setSeconds((s) => s - 1), 1000)
    return () => clearTimeout(timer)
  }, [seconds, onExpire])

  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  const isLow = seconds < 60

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1.5
        rounded-full text-sm font-medium ${
          isLow ? 'bg-red-100 text-red-700' : 'bg-muted text-muted-foreground'
        }`}
    >
      <Clock className="h-4 w-4" />
      {String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}
    </div>
  )
}
