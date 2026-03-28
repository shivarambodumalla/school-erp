'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { X, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface CloneClassYearSheetProps {
  classYearId: string
  className: string
  onClose: () => void
}

interface AcademicYear {
  id: string
  name: string
}

export function CloneClassYearSheet({ classYearId, className, onClose }: CloneClassYearSheetProps) {
  const router = useRouter()
  const [years, setYears] = useState<AcademicYear[]>([])
  const [targetYearId, setTargetYearId] = useState('')
  const [cloneSubjects, setCloneSubjects] = useState(true)
  const [cloneContent, setCloneContent] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loadingYears, setLoadingYears] = useState(true)

  useEffect(() => {
    fetch('/api/school/academic').then(async r => {
      if (!r.ok) { setLoadingYears(false); return }
      const data = await r.json()
      const allYears: AcademicYear[] = data.academicYears ?? data.years ?? []
      if (Array.isArray(allYears)) setYears(allYears)
      setLoadingYears(false)
    }).catch(() => setLoadingYears(false))
  }, [])

  const handleClone = async () => {
    if (!targetYearId) { toast.error('Select a target academic year'); return }
    setSaving(true)
    const res = await fetch(`/api/school/classes/${classYearId}/clone`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetAcademicYearId: targetYearId, cloneSubjects, cloneContent }),
    })
    if (res.ok) {
      const data = await res.json() as { newClassYearId: string }
      toast.success(`${className} cloned as Draft`)
      onClose()
      router.push(`/management/institution/classes/${data.newClassYearId}`)
    } else {
      const e = await res.json()
      toast.error(e.error ?? 'Clone failed')
    }
    setSaving(false)
  }

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/50" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-background border-l shadow-xl flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Copy className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Clone {className}</h2>
          </div>
          <Button variant="ghost" size="icon" className="h-9 w-9" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="p-4 space-y-5 flex-1 overflow-y-auto">
          <div>
            <label className="text-sm font-medium mb-1 block">Target Academic Year</label>
            {loadingYears ? (
              <div className="h-10 rounded-lg bg-muted animate-pulse" />
            ) : (
              <select value={targetYearId} onChange={e => setTargetYearId(e.target.value)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                <option value="">Select year...</option>
                {years.map(y => <option key={y.id} value={y.id}>{y.name}</option>)}
              </select>
            )}
          </div>

          <div className="space-y-3">
            <label className="flex items-start gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50 min-h-[44px]">
              <input type="checkbox" checked={cloneSubjects} onChange={e => {
                setCloneSubjects(e.target.checked)
                if (!e.target.checked) setCloneContent(false)
              }} className="h-4 w-4 accent-primary mt-0.5" />
              <div>
                <span className="text-sm font-medium">Clone Subjects</span>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Copies all subjects and teacher assignments
                </p>
              </div>
            </label>

            <label className={`flex items-start gap-3 p-3 rounded-lg border min-h-[44px]
              ${cloneSubjects ? 'cursor-pointer hover:bg-muted/50' : 'opacity-50 cursor-not-allowed'}`}>
              <input type="checkbox" checked={cloneContent} disabled={!cloneSubjects}
                onChange={e => setCloneContent(e.target.checked)} className="h-4 w-4 accent-primary mt-0.5" />
              <div>
                <span className="text-sm font-medium">Clone Content</span>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Copies all materials and posts (unpublished)
                </p>
              </div>
            </label>
          </div>
        </div>
        <div className="p-4 border-t">
          <Button className="w-full min-h-[44px]" disabled={!targetYearId || saving} onClick={handleClone}>
            {saving ? 'Cloning...' : 'Clone Class'}
          </Button>
        </div>
      </div>
    </>
  )
}
