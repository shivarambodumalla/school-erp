'use client'

import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

interface Props {
  subjects: string[]
  onChange: (subjects: string[]) => void
}

export function SubjectPills({ subjects, onChange }: Props) {
  const [input, setInput] = useState('')

  const addSubject = () => {
    const val = input.trim()
    if (val && !subjects.includes(val)) {
      onChange([...subjects, val])
    }
    setInput('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { e.preventDefault(); addSubject() }
  }

  const remove = (subject: string) => {
    onChange(subjects.filter((s) => s !== subject))
  }

  return (
    <div className="space-y-1.5">
      <Label>Linked Subjects</Label>
      <div className="flex gap-2">
        <Input value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown} placeholder="Type subject and press Enter" className="flex-1" />
        <Button type="button" variant="outline" onClick={addSubject} className="min-h-[44px] shrink-0">
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      {subjects.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {subjects.map((sub) => (
            <span key={sub}
              className="inline-flex items-center gap-1 text-sm px-3 py-1 rounded-full bg-primary/10 text-primary">
              {sub}
              <button type="button" onClick={() => remove(sub)} className="hover:text-destructive">
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
