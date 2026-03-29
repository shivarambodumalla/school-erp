'use client'

import { useCallback, useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Building2, Trash2, Pencil } from 'lucide-react'
import { toast } from 'sonner'
import type { DepartmentRow } from './types'

export function DepartmentsCard() {
  const [departments, setDepartments] = useState<DepartmentRow[]>([])
  const [fetched, setFetched] = useState(false)
  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [editId, setEditId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [saving, setSaving] = useState(false)

  const refresh = useCallback(async () => {
    const res = await fetch('/api/school/settings/departments')
    if (res.ok) {
      setDepartments(await res.json())
      setFetched(true)
    }
  }, [])

  useEffect(() => { refresh() }, [refresh])

  const add = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/school/settings/departments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName, description: newDesc || undefined }),
      })
      if (res.status === 409) {
        toast.error('Department name already exists')
        return
      }
      if (res.ok) {
        setShowAdd(false)
        setNewName('')
        setNewDesc('')
        toast.success('Department added')
        await refresh()
      }
    } finally {
      setSaving(false)
    }
  }

  const saveEdit = async (id: string) => {
    const res = await fetch(`/api/school/settings/departments/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editName }),
    })
    if (res.status === 409) {
      toast.error('Department name already exists')
      return
    }
    if (res.ok) {
      setEditId(null)
      toast.success('Department updated')
      await refresh()
    }
  }

  const remove = async (id: string) => {
    const res = await fetch(`/api/school/settings/departments/${id}`, {
      method: 'DELETE',
    })
    if (!res.ok) {
      const err = await res.json()
      toast.error(err.error)
      return
    }
    toast.success('Department deleted')
    await refresh()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Building2 className="h-5 w-5" /> Departments
          </span>
          <Button size="sm" className="min-h-[44px]" onClick={() => setShowAdd(!showAdd)}>
            {showAdd ? 'Cancel' : 'Add'}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {showAdd && (
          <div className="flex flex-wrap gap-2 items-end border rounded-lg p-3">
            <div className="space-y-1 flex-1 min-w-[160px]">
              <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Department name" />
            </div>
            <div className="space-y-1 flex-1 min-w-[160px]">
              <Input value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="Description (optional)" />
            </div>
            <Button className="min-h-[44px]" onClick={add} disabled={saving || !newName.trim()}>
              Save
            </Button>
          </div>
        )}
        <div className="divide-y rounded-lg border">
          {departments.map((d) => (
            <div key={d.id} className="flex items-center gap-3 px-4 py-3">
              {editId === d.id ? (
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="flex-1"
                  onKeyDown={(e) => e.key === 'Enter' && saveEdit(d.id)}
                />
              ) : (
                <div className="flex-1">
                  <p className="font-medium">{d.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {d._count.staff} staff{d.description ? ` - ${d.description}` : ''}
                  </p>
                </div>
              )}
              <Button
                variant="ghost" size="icon" className="min-h-[44px] min-w-[44px]"
                onClick={() => {
                  if (editId === d.id) { saveEdit(d.id) } else { setEditId(d.id); setEditName(d.name) }
                }}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost" size="icon"
                className="min-h-[44px] min-w-[44px] text-destructive"
                onClick={() => remove(d.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          {fetched && departments.length === 0 && (
            <p className="px-4 py-6 text-center text-muted-foreground">
              No departments configured yet.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
