'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ColorPicker } from './addDept/ColorPicker'
import { StaffSelector } from './addDept/StaffSelector'
import { SubjectPills } from './addDept/SubjectPills'
import type { Department } from '../types'
import { getDeptInitials } from '../types'

interface StaffOption {
  id: string; firstName: string; lastName: string; designation: string
}

interface Props {
  department: Department
  isAdmin: boolean
}

export function EditDepartmentClient({ department: dept, isAdmin }: Props) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [staffList, setStaffList] = useState<StaffOption[]>([])

  const [name, setName] = useState(dept.name)
  const [description, setDescription] = useState(dept.description ?? '')
  const [color, setColor] = useState(dept.color)
  const [avatarUrl, setAvatarUrl] = useState(dept.avatarUrl ?? '')
  const [status, setStatus] = useState(dept.status)
  const [hodId, setHodId] = useState<string | null>(dept.hodId)
  const [deputyHodId, setDeputyHodId] = useState<string | null>(dept.deputyHodId)
  const [subjects, setSubjects] = useState<string[]>(dept.subjectNames)

  useEffect(() => {
    fetch('/api/school/staff?status=ACTIVE&limit=500')
      .then((r) => r.json())
      .then((data: { staff?: StaffOption[] }) => {
        if (Array.isArray(data.staff)) setStaffList(data.staff)
        else if (Array.isArray(data)) setStaffList(data as StaffOption[])
      })
      .catch(() => toast.error('Failed to load staff'))
  }, [])

  const initials = name ? getDeptInitials(name) : '??'

  const handleSave = async () => {
    if (!name.trim()) { toast.error('Department name is required'); return }
    setSaving(true)
    try {
      const body = { name, description: description || null, color, avatarUrl: avatarUrl || null, status, hodId, deputyHodId, subjectNames: subjects }
      const res = await fetch(`/api/school/departments/${dept.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      })
      if (res.ok) { toast.success('Department updated'); router.push(`/management/departments/${dept.id}`) }
      else { const err = (await res.json()) as { error: string }; toast.error(err.error) }
    } catch { toast.error('Failed to save') }
    setSaving(false)
  }

  if (!isAdmin) return <p className="text-center py-10 text-muted-foreground">Admin access required</p>

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold tracking-tight">Edit Department</h1>

      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6">
        {/* LEFT: Preview */}
        <div className="rounded-xl border bg-card p-6 flex flex-col items-center gap-4">
          <div className="h-24 w-24 rounded-2xl flex items-center justify-center text-white text-3xl font-bold" style={{ backgroundColor: color }}>
            {avatarUrl ? <img src={avatarUrl} alt={name} className="h-full w-full rounded-2xl object-cover" /> : initials}
          </div>
          <p className="font-semibold text-center">{name || 'Department Name'}</p>
          <span className={`text-xs px-2 py-1 rounded-full ${status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
            {status}
          </span>
          {subjects.length > 0 && (
            <div className="flex flex-wrap justify-center gap-1">
              {subjects.slice(0, 4).map((s) => (
                <span key={s} className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: `${color}20`, color }}>{s}</span>
              ))}
              {subjects.length > 4 && <span className="text-xs text-muted-foreground">+{subjects.length - 4}</span>}
            </div>
          )}
        </div>

        {/* RIGHT: Form */}
        <div className="space-y-5">
          <ColorPicker color={color} onChange={setColor} name={name} />
          <div className="space-y-1.5">
            <Label>Avatar URL</Label>
            <Input value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} placeholder="https://..." />
          </div>
          <div className="space-y-1.5">
            <Label>Department Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Mathematics" />
          </div>
          <div className="space-y-1.5">
            <Label>Status</Label>
            <select value={status} onChange={(e) => setStatus(e.target.value as 'ACTIVE' | 'INACTIVE')}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm min-h-[44px]">
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Brief description..." />
          </div>
          <StaffSelector label="Head of Department" staffList={staffList} selectedId={hodId} excludeId={deputyHodId} onSelect={setHodId} />
          <StaffSelector label="Deputy HOD" staffList={staffList} selectedId={deputyHodId} excludeId={hodId} onSelect={setDeputyHodId} />
          <SubjectPills subjects={subjects} onChange={setSubjects} />

          <div className="flex items-center gap-3 pt-4">
            <Button variant="outline" onClick={() => router.push(`/management/departments/${dept.id}`)} className="min-h-[44px]">Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="min-h-[44px]">{saving ? 'Saving...' : 'Save Changes'}</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
