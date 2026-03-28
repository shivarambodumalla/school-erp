'use client'

import { useState } from 'react'
import { Plus, Trash2, Shield, Phone, Pencil } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

interface Guardian {
  type: 'FATHER' | 'MOTHER' | 'GUARDIAN'
  name: string
  phone: string
  email: string
  relationship: string
  isPrimaryContact: boolean
  isEmergencyContact: boolean
  canLogin: boolean
}

interface Props {
  guardians: Guardian[]
  onChange: (guardians: Guardian[]) => void
  error?: string
}

const EMPTY_GUARDIAN: Guardian = {
  type: 'FATHER', name: '', phone: '', email: '',
  relationship: '', isPrimaryContact: false,
  isEmergencyContact: false, canLogin: false,
}

export function AdmissionStep2Guardians({ guardians, onChange, error }: Props) {
  const [editing, setEditing] = useState<Guardian | null>(
    guardians.length === 0 ? { ...EMPTY_GUARDIAN } : null,
  )
  const [editingIndex, setEditingIndex] = useState<number | null>(null)

  function saveGuardian() {
    if (!editing || !editing.name || !editing.phone) return

    if (editingIndex !== null) {
      // Update existing
      const updated = [...guardians]
      updated[editingIndex] = editing
      onChange(updated)
    } else {
      // Add new
      onChange([...guardians, editing])
    }
    setEditing(null)
    setEditingIndex(null)
  }

  function startEdit(idx: number) {
    setEditing({ ...guardians[idx] })
    setEditingIndex(idx)
  }

  function cancelEdit() {
    setEditing(null)
    setEditingIndex(null)
  }

  function removeGuardian(idx: number) {
    onChange(guardians.filter((_, i) => i !== idx))
    if (editingIndex === idx) {
      setEditing(null)
      setEditingIndex(null)
    }
  }

  return (
    <div className="space-y-5">
      {error && <p className="text-sm text-red-500">{error}</p>}

      {/* Existing guardians */}
      <div className="space-y-3">
        {guardians.map((g, i) => {
          if (editingIndex === i) return null // Hide card when editing inline
          return (
            <div key={i} className="rounded-lg border p-4 flex items-start
              justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full
                    bg-muted">{g.type}</span>
                  <span className="font-medium text-sm">{g.name}</span>
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Phone className="h-3 w-3" /> {g.phone}
                  </span>
                  {g.email && <span>{g.email}</span>}
                </div>
                <div className="flex gap-2 mt-1.5 flex-wrap">
                  {g.isPrimaryContact && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100
                      text-blue-700">Primary</span>
                  )}
                  {g.isEmergencyContact && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100
                      text-amber-700 flex items-center gap-0.5">
                      <Shield className="h-2.5 w-2.5" /> Emergency
                    </span>
                  )}
                  {g.canLogin && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-100
                      text-green-700">Can Login</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => startEdit(i)}
                  className="p-1.5 rounded hover:bg-muted text-muted-foreground
                    hover:text-foreground transition-colors">
                  <Pencil className="h-4 w-4" />
                </button>
                <button onClick={() => removeGuardian(i)}
                  className="p-1.5 rounded hover:bg-red-100 text-red-500">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Add/Edit guardian form */}
      {editing ? (
        <div className="rounded-lg border bg-muted/30 p-4 space-y-4">
          <p className="text-sm font-medium">
            {editingIndex !== null ? 'Edit Guardian' : 'Add Guardian'}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label>Type *</Label>
              <select value={editing.type}
                onChange={e => setEditing({ ...editing, type: e.target.value as Guardian['type'] })}
                className="w-full h-11 rounded-md border border-input bg-background px-3 text-sm">
                <option value="FATHER">Father</option>
                <option value="MOTHER">Mother</option>
                <option value="GUARDIAN">Guardian</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Name *</Label>
              <Input value={editing.name}
                onChange={e => setEditing({ ...editing, name: e.target.value })}
                className="min-h-[44px]" />
            </div>
            <div className="space-y-1.5">
              <Label>Phone *</Label>
              <Input value={editing.phone}
                onChange={e => setEditing({ ...editing, phone: e.target.value })}
                className="min-h-[44px]" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input value={editing.email} type="email"
                onChange={e => setEditing({ ...editing, email: e.target.value })}
                className="min-h-[44px]" />
            </div>
            {editing.type === 'GUARDIAN' && (
              <div className="space-y-1.5">
                <Label>Relationship</Label>
                <Input value={editing.relationship}
                  onChange={e => setEditing({ ...editing, relationship: e.target.value })}
                  className="min-h-[44px]" />
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-4">
            {[
              { key: 'isPrimaryContact' as const, label: 'Primary Contact' },
              { key: 'isEmergencyContact' as const, label: 'Emergency Contact' },
              { key: 'canLogin' as const, label: 'Can Login (Portal)' },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={editing[key]}
                  onChange={e => setEditing({ ...editing, [key]: e.target.checked })}
                  className="rounded border-gray-300" />
                {label}
              </label>
            ))}
          </div>

          <div className="flex gap-2">
            <Button size="sm" onClick={saveGuardian}
              disabled={!editing.name || !editing.phone} className="min-h-[44px]">
              {editingIndex !== null ? 'Save Changes' : 'Add Guardian'}
            </Button>
            <Button size="sm" variant="ghost" onClick={cancelEdit} className="min-h-[44px]">
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Button variant="outline" onClick={() => { setEditing({ ...EMPTY_GUARDIAN }); setEditingIndex(null) }}>
          <Plus className="h-4 w-4 mr-1.5" />
          Add {guardians.length > 0 ? 'Another ' : ''}Guardian
        </Button>
      )}
    </div>
  )
}
