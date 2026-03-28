'use client'

import { useState } from 'react'
import { GraduationCap, Loader2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

interface ClassItem {
  id: string; name: string
  sections: Array<{ id: string; name: string }>
}

interface Props {
  classes: ClassItem[]
  acting: boolean
  onConfirm: (classId: string, sectionId?: string) => void
  onClose: () => void
}

export function EnrollModal({ classes, acting, onConfirm, onClose }: Props) {
  const [classId, setClassId] = useState('')
  const [sectionId, setSectionId] = useState('')
  const selectedClass = classes.find(c => c.id === classId)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-background rounded-xl border shadow-lg w-full max-w-md p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Enroll Student</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Class *</Label>
            <select value={classId}
              onChange={e => { setClassId(e.target.value); setSectionId('') }}
              className="w-full h-11 rounded-md border border-input bg-background px-3 text-sm">
              <option value="">Select class</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {selectedClass && selectedClass.sections.length > 0 && (
            <div className="space-y-1.5">
              <Label>Section</Label>
              <select value={sectionId}
                onChange={e => setSectionId(e.target.value)}
                className="w-full h-11 rounded-md border border-input bg-background px-3 text-sm">
                <option value="">Select section</option>
                {selectedClass.sections.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onConfirm(classId, sectionId || undefined)}
            disabled={!classId || acting}>
            {acting ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> :
              <GraduationCap className="h-4 w-4 mr-1.5" />}
            Enroll
          </Button>
        </div>
      </div>
    </div>
  )
}
