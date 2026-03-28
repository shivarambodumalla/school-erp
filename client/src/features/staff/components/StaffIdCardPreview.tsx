'use client'

import { useState, useEffect, useCallback } from 'react'
import { ArrowLeft, CreditCard } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { StaffDetail, StaffIdCardItem } from '../types'

export function StaffIdCardPreview({ staffId }: { staffId: string }) {
  const router = useRouter()
  const [staff, setStaff] = useState<StaffDetail | null>(null)
  const [card, setCard] = useState<StaffIdCardItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [validTill, setValidTill] = useState('')
  const [issuing, setIssuing] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    const [staffRes, cardRes] = await Promise.all([
      fetch(`/api/school/staff/${staffId}`),
      fetch(`/api/school/staff/${staffId}/id-card`),
    ])
    if (staffRes.ok) setStaff((await staffRes.json()) as StaffDetail)
    if (cardRes.ok) {
      const data = (await cardRes.json()) as { card: StaffIdCardItem | null }
      setCard(data.card)
    }
    setLoading(false)
  }, [staffId])

  useEffect(() => { fetchData() }, [fetchData])

  const issueCard = async () => {
    if (!validTill) { toast.error('Set validity date'); return }
    setIssuing(true)
    const res = await fetch(`/api/school/staff/${staffId}/id-card`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ validTill }),
    })
    setIssuing(false)
    if (res.ok) {
      toast.success('ID Card issued')
      fetchData()
    }
  }

  if (loading) {
    return <div className="h-96 rounded-xl bg-muted animate-pulse" />
  }

  if (!staff) {
    return <p className="text-muted-foreground text-center py-20">Staff not found</p>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon"
          onClick={() => router.push(`/management/staff/${staffId}`)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">ID Card</h1>
      </div>

      {/* Card Preview */}
      <div className="max-w-sm mx-auto">
        <div className="rounded-2xl border-2 p-6 bg-gradient-to-br from-primary/5 to-primary/10">
          <div className="text-center mb-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">
              Staff Identity Card
            </p>
          </div>
          <div className="flex flex-col items-center gap-3">
            <div className="h-20 w-20 rounded-full bg-primary/20 flex items-center justify-center
              text-primary text-2xl font-bold">
              {staff.firstName[0]}{staff.lastName[0]}
            </div>
            <div className="text-center">
              <p className="text-lg font-bold">{staff.firstName} {staff.lastName}</p>
              <p className="text-sm text-muted-foreground">{staff.designation}</p>
              <p className="text-xs font-mono mt-1">{staff.employeeNo}</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-dashed space-y-1 text-sm">
            {staff.department && (
              <p><span className="text-muted-foreground">Dept:</span> {staff.department.name}</p>
            )}
            {staff.phone && (
              <p><span className="text-muted-foreground">Phone:</span> {staff.phone}</p>
            )}
            {card && (
              <p>
                <span className="text-muted-foreground">Valid till:</span>{' '}
                {new Date(card.validTill).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Issue Controls */}
      <div className="max-w-sm mx-auto space-y-3">
        {card ? (
          <div className="rounded-xl border p-4 text-center text-sm">
            <CreditCard className="h-5 w-5 mx-auto mb-2 text-green-600" />
            <p className="font-medium">Active card issued</p>
            <p className="text-muted-foreground">
              Issued {new Date(card.issuedAt).toLocaleDateString()} - Valid till{' '}
              {new Date(card.validTill).toLocaleDateString()}
            </p>
          </div>
        ) : null}
        <div>
          <Label>Valid Till</Label>
          <Input type="date" value={validTill}
            onChange={e => setValidTill(e.target.value)}
            className="min-h-[44px] mt-1" />
        </div>
        <Button onClick={issueCard} disabled={issuing}
          className="w-full min-h-[44px]">
          {issuing ? 'Issuing...' : card ? 'Re-issue Card' : 'Issue Card'}
        </Button>
      </div>
    </div>
  )
}
