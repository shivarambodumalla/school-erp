'use client'

import { useState, useEffect, useRef } from 'react'
import { LogIn, LogOut, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'

type CheckState = 'NOT_CHECKED_IN' | 'CHECKED_IN' | 'CHECKED_OUT'

export function CheckInWidget() {
  const [state, setState] = useState<CheckState>('NOT_CHECKED_IN')
  const [checkInTime, setCheckInTime] = useState<string | null>(null)
  const [checkOutTime, setCheckOutTime] = useState<string | null>(null)
  const [elapsed, setElapsed] = useState('00:00:00')
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Fetch today's attendance status on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/school/staff/checkin')
        if (res.ok) {
          const data = await res.json()
          if (data.checkOutTime) {
            setCheckInTime(data.checkInTime)
            setCheckOutTime(data.checkOutTime)
            setState('CHECKED_OUT')
          } else if (data.checkInTime) {
            setCheckInTime(data.checkInTime)
            setState('CHECKED_IN')
          }
        }
      } catch { /* remain NOT_CHECKED_IN */ }
      setInitialLoading(false)
    })()
  }, [])

  useEffect(() => {
    if (state === 'CHECKED_IN' && checkInTime) {
      const tick = () => {
        const [h, m] = checkInTime.split(':').map(Number)
        const start = new Date()
        start.setHours(h, m, 0, 0)
        const diff = Math.max(0, Math.floor((Date.now() - start.getTime()) / 1000))
        const hrs = String(Math.floor(diff / 3600)).padStart(2, '0')
        const mins = String(Math.floor((diff % 3600) / 60)).padStart(2, '0')
        const secs = String(diff % 60).padStart(2, '0')
        setElapsed(`${hrs}:${mins}:${secs}`)
      }
      tick()
      timerRef.current = setInterval(tick, 1000)
      return () => { if (timerRef.current) clearInterval(timerRef.current) }
    }
  }, [state, checkInTime])

  async function handleCheckIn() {
    setLoading(true)
    try {
      const res = await fetch('/api/school/staff/checkin', { method: 'POST' })
      if (res.status === 409) {
        toast.info('Already checked in today')
        return
      }
      if (!res.ok) throw new Error('Check-in failed')
      const data = await res.json()
      setCheckInTime(data.checkInTime)
      setState('CHECKED_IN')
      toast.success('Checked in successfully')
    } catch {
      toast.error('Failed to check in')
    } finally {
      setLoading(false)
    }
  }

  async function handleCheckOut() {
    setLoading(true)
    try {
      const res = await fetch('/api/school/staff/checkin', { method: 'PATCH' })
      if (res.status === 409) {
        toast.info('Already checked out')
        return
      }
      if (!res.ok) throw new Error('Check-out failed')
      const data = await res.json()
      setCheckOutTime(data.checkOutTime)
      setState('CHECKED_OUT')
      if (timerRef.current) clearInterval(timerRef.current)
      toast.success('Checked out successfully')
    } catch {
      toast.error('Failed to check out')
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) {
    return (
      <Card>
        <CardContent className="p-4 flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-muted animate-pulse shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-32 rounded bg-muted animate-pulse" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-4">
        <div className="h-12 w-12 rounded-full bg-primary/10
          flex items-center justify-center shrink-0">
          <Clock className="h-5 w-5 text-primary" />
        </div>

        <div className="flex-1 min-w-0">
          {state === 'NOT_CHECKED_IN' && (
            <p className="text-sm text-muted-foreground">
              You have not checked in today
            </p>
          )}
          {state === 'CHECKED_IN' && (
            <>
              <p className="text-sm text-muted-foreground">
                Checked in at {checkInTime}
              </p>
              <p className="text-lg font-mono font-bold">{elapsed}</p>
            </>
          )}
          {state === 'CHECKED_OUT' && (
            <p className="text-sm text-muted-foreground">
              {checkInTime} - {checkOutTime}
            </p>
          )}
        </div>

        {state === 'NOT_CHECKED_IN' && (
          <Button
            onClick={handleCheckIn}
            disabled={loading}
            className="min-h-[44px] min-w-[44px]"
          >
            <LogIn className="h-4 w-4 mr-2" /> Check In
          </Button>
        )}
        {state === 'CHECKED_IN' && (
          <Button
            variant="outline"
            onClick={handleCheckOut}
            disabled={loading}
            className="min-h-[44px] min-w-[44px]"
          >
            <LogOut className="h-4 w-4 mr-2" /> Check Out
          </Button>
        )}
        {state === 'CHECKED_OUT' && (
          <span className="text-xs font-medium text-green-600
            bg-green-100 px-3 py-1.5 rounded-full">
            Done for today
          </span>
        )}
      </CardContent>
    </Card>
  )
}
