'use client'

import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from '@/components/ui/sheet'
import { ColorPicker } from './addDept/ColorPicker'
import { StaffSelector } from './addDept/StaffSelector'
import { SubjectPills } from './addDept/SubjectPills'

interface StaffOption {
  id: string; firstName: string; lastName: string; designation: string
}

interface Props {
  open: boolean
  onClose: () => void
  onCreated: () => void
}

export function AddDepartmentSheet({ open, onClose, onCreated }: Props) {
  const [staffList, setStaffList] = useState<StaffOption[]>([])
  const [color, setColor] = useState('#6366f1')
  const [name, setName] = useState('')
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE')
  const [description, setDescription] = useState('')
  const [hodId, setHodId] = useState<string | null>(null)
  const [deputyHodId, setDeputyHodId] = useState<string | null>(null)
  const [subjects, setSubjects] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)

  const fetchStaff = useCallback(async () => {
    try {
      const res = await fetch('/api/school/staff')
      if (res.ok) setStaffList(await res.json() as StaffOption[])
    } catch { /* ignore */ }
  }, [])

  useEffect(() => { if (open) fetchStaff() }, [open, fetchStaff])

  const reset = () => {
    setColor('#6366f1'); setName(''); setStatus('ACTIVE')
    setDescription(''); setHodId(null); setDeputyHodId(null); setSubjects([])
  }

  const handleSubmit = async () => {
    if (name.trim().length < 2) { toast.error('Name must be at least 2 characters'); return }
    if (!hodId) { toast.error('Please select an HOD'); return }
    setSubmitting(true)
    try {
      const res = await fetch('/api/school/departments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(), color, status,
          description: description.trim() || undefined,
          hodId, deputyHodId: deputyHodId || undefined,
          subjectNames: subjects,
        }),
      })
      if (res.ok) {
        toast.success('Department created'); reset(); onClose(); onCreated()
      } else {
        const err = (await res.json()) as { error: string }
        toast.error(err.error)
      }
    } catch { toast.error('Failed to create department') }
    setSubmitting(false)
  }

  return (
    <Sheet open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <SheetContent side="right" className="sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Add Department</SheetTitle>
          <SheetDescription>Create a new academic or administrative department</SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-5">
          <ColorPicker color={color} onChange={setColor} name={name} />

          <div className="space-y-1.5">
            <Label>Department Name *</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Mathematics" />
          </div>

          <div className="space-y-1.5">
            <Label>Status</Label>
            <select value={status} onChange={(e) => setStatus(e.target.value as 'ACTIVE' | 'INACTIVE')}
              className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm min-h-[44px]">
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description..." rows={3} />
          </div>

          <StaffSelector label="Head of Department *" staffList={staffList}
            selectedId={hodId} excludeId={deputyHodId} onSelect={setHodId} />

          <StaffSelector label="Deputy HOD" staffList={staffList}
            selectedId={deputyHodId} excludeId={hodId} onSelect={setDeputyHodId} />

          <SubjectPills subjects={subjects} onChange={setSubjects} />
        </div>

        <div className="flex justify-end gap-3 mt-8 pt-4 border-t">
          <Button variant="outline" onClick={onClose} className="min-h-[44px]">Cancel</Button>
          <Button onClick={handleSubmit} disabled={submitting} className="min-h-[44px]">
            {submitting ? 'Creating...' : 'Create Department'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
