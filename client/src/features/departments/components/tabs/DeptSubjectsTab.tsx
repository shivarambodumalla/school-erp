'use client'

import { useState } from 'react'
import { Plus, X, BookOpen } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Props {
  deptId: string
  subjectNames: string[]
  isAdmin: boolean
  color: string
}

export function DeptSubjectsTab({ deptId, subjectNames: initial, isAdmin, color }: Props) {
  const [subjects, setSubjects] = useState<string[]>(initial)
  const [input, setInput] = useState('')

  const save = async (updated: string[]) => {
    try {
      const res = await fetch(`/api/school/departments/${deptId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subjectNames: updated }),
      })
      if (res.ok) {
        setSubjects(updated)
        toast.success('Subjects updated')
      } else {
        const err = (await res.json()) as { error: string }
        toast.error(err.error)
      }
    } catch { toast.error('Failed to update subjects') }
  }

  const addSubject = () => {
    const val = input.trim()
    if (!val) return
    if (subjects.includes(val)) { toast.error('Subject already exists'); return }
    save([...subjects, val])
    setInput('')
  }

  const removeSubject = (sub: string) => {
    save(subjects.filter((s) => s !== sub))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { e.preventDefault(); addSubject() }
  }

  return (
    <div className="space-y-4 pt-4">
      {isAdmin && (
        <div className="flex gap-2">
          <Input value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown} placeholder="Type subject name..." className="flex-1" />
          <Button variant="outline" onClick={addSubject} className="gap-1.5 min-h-[44px] shrink-0">
            <Plus className="h-4 w-4" /> Link Subject
          </Button>
        </div>
      )}

      {subjects.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <BookOpen className="h-10 w-10 mx-auto mb-2" />
          <p className="font-medium">No subjects linked</p>
          <p className="text-sm">Add subjects to this department</p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {subjects.map((sub) => (
            <span key={sub}
              className="inline-flex items-center gap-1.5 text-sm px-4 py-2 rounded-full font-medium"
              style={{ backgroundColor: `${color}20`, color }}>
              {sub}
              {isAdmin && (
                <button type="button" onClick={() => removeSubject(sub)}
                  className="hover:opacity-70 min-h-[44px] min-w-[22px] flex items-center">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
