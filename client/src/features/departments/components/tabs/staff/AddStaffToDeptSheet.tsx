'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Search, Check } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from '@/components/ui/sheet'

interface StaffOption {
  id: string; firstName: string; lastName: string; designation: string
}

interface Props {
  open: boolean
  onClose: () => void
  deptId: string
  onAdded: () => void
  existingStaffIds: string[]
}

export function AddStaffToDeptSheet({ open, onClose, deptId, onAdded, existingStaffIds }: Props) {
  const [allStaff, setAllStaff] = useState<StaffOption[]>([])
  const [selected, setSelected] = useState<string[]>([])
  const [query, setQuery] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fetchStaff = useCallback(async () => {
    try {
      const res = await fetch('/api/school/staff')
      if (res.ok) setAllStaff(await res.json() as StaffOption[])
    } catch { /* ignore */ }
  }, [])

  useEffect(() => { if (open) { fetchStaff(); setSelected([]); setQuery('') } }, [open, fetchStaff])

  const available = useMemo(() => {
    let list = allStaff.filter((s) => !existingStaffIds.includes(s.id))
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter((s) => `${s.firstName} ${s.lastName}`.toLowerCase().includes(q))
    }
    return list
  }, [allStaff, existingStaffIds, query])

  const toggle = (id: string) => {
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])
  }

  const handleAdd = async () => {
    setSubmitting(true)
    try {
      await Promise.all(selected.map((staffId) =>
        fetch(`/api/school/departments/${deptId}/staff`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ staffId }),
        })
      ))
      toast.success(`${selected.length} staff added`); onClose(); onAdded()
    } catch { toast.error('Failed to add staff') }
    setSubmitting(false)
  }

  return (
    <Sheet open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <SheetContent side="right" className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Add Staff to Department</SheetTitle>
          <SheetDescription>Select staff members to add</SheetDescription>
        </SheetHeader>
        <div className="mt-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search..." className="pl-9" />
          </div>
          <div className="max-h-[60vh] overflow-y-auto rounded-lg border divide-y">
            {available.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No available staff</p>
            ) : available.map((s) => (
              <button key={s.id} type="button" onClick={() => toggle(s.id)}
                className={`w-full flex items-center gap-3 p-3 hover:bg-muted transition-colors text-left min-h-[44px]
                  ${selected.includes(s.id) ? 'bg-primary/5' : ''}`}>
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold shrink-0">
                  {s.firstName[0]}{s.lastName[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{s.firstName} {s.lastName}</p>
                  <p className="text-xs text-muted-foreground truncate">{s.designation}</p>
                </div>
                {selected.includes(s.id) && <Check className="h-4 w-4 text-primary shrink-0" />}
              </button>
            ))}
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
          <Button variant="outline" onClick={onClose} className="min-h-[44px]">Cancel</Button>
          <Button onClick={handleAdd} disabled={selected.length === 0 || submitting} className="min-h-[44px]">
            {submitting ? 'Adding...' : `Add ${selected.length} Staff`}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
