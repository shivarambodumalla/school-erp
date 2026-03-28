'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { FileText, Plus, Trash2, GripVertical } from 'lucide-react'
import { toast } from 'sonner'
import type { StaffSettingsData } from './types'

interface Props {
  settings: StaffSettingsData
  onUpdate: (s: StaffSettingsData) => void
}

export function StaffDocumentTypesCard({ settings, onUpdate }: Props) {
  const [items, setItems] = useState<string[]>(settings.documentTypes ?? [])
  const [newType, setNewType] = useState('')
  const [dragIdx, setDragIdx] = useState<number | null>(null)

  const persist = async (updated: string[]) => {
    setItems(updated)
    const res = await fetch('/api/school/settings/staff', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ documentTypes: updated }),
    })
    if (res.ok) {
      onUpdate(await res.json())
      toast.success('Document types updated')
    }
  }

  const add = () => {
    if (!newType.trim()) return
    if (items.includes(newType.trim())) {
      toast.error('Document type already exists')
      return
    }
    persist([...items, newType.trim()])
    setNewType('')
  }

  const remove = (idx: number) => {
    persist(items.filter((_, i) => i !== idx))
  }

  const handleDragStart = (idx: number) => setDragIdx(idx)

  const handleDrop = (targetIdx: number) => {
    if (dragIdx === null || dragIdx === targetIdx) return
    const copy = [...items]
    const [moved] = copy.splice(dragIdx, 1)
    copy.splice(targetIdx, 0, moved)
    setDragIdx(null)
    persist(copy)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" /> Document Types
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2">
          <Input
            value={newType}
            onChange={(e) => setNewType(e.target.value)}
            placeholder="Add document type"
            className="flex-1"
            onKeyDown={(e) => e.key === 'Enter' && add()}
          />
          <Button
            variant="outline" size="icon"
            className="min-h-[44px] min-w-[44px]"
            disabled={!newType.trim()}
            onClick={add}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Drag to reorder. These types appear when uploading staff documents.
        </p>
        <div className="divide-y rounded-lg border">
          {items.map((item, idx) => (
            <div
              key={item}
              draggable
              onDragStart={() => handleDragStart(idx)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(idx)}
              className="flex items-center gap-2 px-4 py-2 cursor-grab active:cursor-grabbing"
            >
              <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="flex-1 text-sm">{item}</span>
              <Button
                variant="ghost" size="icon"
                className="min-h-[44px] min-w-[44px] text-destructive"
                onClick={() => remove(idx)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          {items.length === 0 && (
            <p className="px-4 py-6 text-center text-sm text-muted-foreground">
              No document types configured yet.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
