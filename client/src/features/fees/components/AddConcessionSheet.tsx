'use client'

import { useState } from 'react'
import { useInstitutionId } from '@/hooks/useInstitutionId'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'

interface Props {
  open: boolean
  onClose: () => void
  onCreated: () => void
}

interface StudentOption { id: string; firstName: string; lastName: string }

export function AddConcessionSheet({ open, onClose, onCreated }: Props) {
  const { apiParam, addParams } = useInstitutionId()
  const [search, setSearch] = useState('')
  const [results, setResults] = useState<StudentOption[]>([])
  const [studentId, setStudentId] = useState('')
  const [studentLabel, setStudentLabel] = useState('')
  const [name, setName] = useState('')
  const [type, setType] = useState('FIXED')
  const [amount, setAmount] = useState(0)
  const [validFrom, setValidFrom] = useState('')
  const [validTill, setValidTill] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSearch = async (q: string) => {
    setSearch(q)
    if (q.length < 2) { setResults([]); return }
    const sp = new URLSearchParams({ search: q })
    addParams(sp)
    const res = await fetch(`/api/school/students?${sp}`)
    if (res.ok) {
      const data = await res.json()
      setResults(data.students ?? data ?? [])
    }
  }

  const selectStudent = (s: StudentOption) => {
    setStudentId(s.id)
    setStudentLabel(`${s.firstName} ${s.lastName}`)
    setResults([]); setSearch('')
  }

  const handleSubmit = async () => {
    if (!studentId || !name || !amount || !validFrom) {
      toast.error('Fill all required fields'); return
    }
    setSaving(true)
    try {
      const res = await fetch(`/api/school/fees/concessions${apiParam}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId, name, type, amount, validFrom,
          validTill: validTill || undefined, notes: notes || undefined,
        }),
      })
      if (!res.ok) { toast.error('Failed to create concession'); return }
      toast.success('Concession added')
      onCreated(); onClose()
    } catch { toast.error('Failed') }
    finally { setSaving(false) }
  }

  return (
    <Sheet open={open} onOpenChange={() => onClose()}>
      <SheetContent className="sm:max-w-md overflow-y-auto">
        <SheetHeader><SheetTitle>Add Concession</SheetTitle></SheetHeader>
        <div className="mt-6 space-y-4">
          <div className="relative">
            <Label>Student *</Label>
            {studentLabel ? (
              <div className="mt-1 flex items-center gap-2">
                <span className="text-sm font-medium">{studentLabel}</span>
                <Button variant="ghost" size="sm" onClick={() => { setStudentId(''); setStudentLabel('') }}>Change</Button>
              </div>
            ) : (
              <>
                <Input placeholder="Search student..." value={search}
                  onChange={e => handleSearch(e.target.value)} className="min-h-[44px] mt-1" />
                {results.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-popover border rounded-lg shadow-lg z-10 max-h-40 overflow-y-auto">
                    {results.map(s => (
                      <button key={s.id} type="button" onClick={() => selectStudent(s)}
                        className="w-full px-4 py-2.5 text-left hover:bg-muted/50 text-sm">
                        {s.firstName} {s.lastName}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
          <div>
            <Label>Concession Name *</Label>
            <Input value={name} onChange={e => setName(e.target.value)}
              placeholder="e.g. Merit Scholarship" className="min-h-[44px] mt-1" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Type *</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger className="min-h-[44px] mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="FIXED">Fixed ₹</SelectItem>
                  <SelectItem value="PERCENTAGE">Percentage %</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Amount *</Label>
              <Input type="number" min={0} value={amount || ''} onChange={e => setAmount(Number(e.target.value))}
                className="min-h-[44px] mt-1" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Valid From *</Label>
              <Input type="date" value={validFrom} onChange={e => setValidFrom(e.target.value)}
                className="min-h-[44px] mt-1" />
            </div>
            <div>
              <Label>Valid Till</Label>
              <Input type="date" value={validTill} onChange={e => setValidTill(e.target.value)}
                className="min-h-[44px] mt-1" />
            </div>
          </div>
          <div>
            <Label>Notes</Label>
            <Input value={notes} onChange={e => setNotes(e.target.value)} className="min-h-[44px] mt-1" />
          </div>
          <Button onClick={handleSubmit} disabled={saving} className="w-full min-h-[44px]">
            {saving ? 'Saving...' : 'Add Concession'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}