'use client'

import { useState, useEffect, useCallback } from 'react'
import { useInstitutionId } from '@/hooks/useInstitutionId'
import { useRouter } from 'next/navigation'
import { Plus, ArrowRight, Pencil, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import type { SubjectData } from '../../types'

interface SubjectsTabProps {
  classYearId: string
  sections?: { id: string; name: string }[]
}

export function SubjectsTab({ classYearId, sections }: SubjectsTabProps) {
  const router = useRouter()
  const { apiParam } = useInstitutionId()
  const [subjects, setSubjects] = useState<SubjectData[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)

  const fetchSubjects = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/school/classes/${classYearId}/subjects${apiParam}`)
      if (res.ok) setSubjects((await res.json()) as SubjectData[])
    } catch { /* empty */ }
    setLoading(false)
  }, [classYearId])

  useEffect(() => { fetchSubjects() }, [fetchSubjects])

  const handleDelete = async (subjectId: string, name: string) => {
    if (!confirm(`Delete subject "${name}"? This only works if there are no posts or grades.`)) return
    const res = await fetch(`/api/school/classes/${classYearId}/subjects/${subjectId}${apiParam}`, { method: 'DELETE' })
    if (res.ok) { toast.success(`${name} deleted`); fetchSubjects() }
    else { const e = await res.json(); toast.error(e.error ?? 'Cannot delete') }
  }

  const primaryTeacher = (s: SubjectData) => {
    const t = s.teachers.find((t) => t.isPrimary)
    return t?.user.email ?? '—'
  }

  return (
    <div className="space-y-4 pt-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {subjects.length} subject{subjects.length !== 1 ? 's' : ''}
        </p>
        <Button size="sm" className="min-h-[44px]" onClick={() => setShowAdd(true)}>
          <Plus className="h-4 w-4 mr-1" /> Add Subject
        </Button>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-12 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      ) : subjects.length === 0 ? (
        <div className="rounded-xl border bg-card p-8 text-center text-muted-foreground">No subjects yet.</div>
      ) : (
        <div className="rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr className="border-b">
                <th className="text-left px-4 py-3 font-medium">Subject</th>
                <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Code</th>
                <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Periods/wk</th>
                <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Teacher</th>
                <th className="text-right px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((s) => (
                <tr key={s.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{s.name}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{s.code ?? '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{s.weeklyPeriods}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">{primaryTeacher(s)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-9 w-9"
                        onClick={() => setEditId(s.id)} title="Edit">
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-9 w-9 text-red-500 hover:text-red-600"
                        onClick={() => handleDelete(s.id, s.name)} title="Delete">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="sm" className="min-h-[44px]"
                        onClick={() => router.push(`/management/subjects/${s.id}`)}>
                        Open <ArrowRight className="h-3.5 w-3.5 ml-1" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showAdd && (
        <AddSubjectForm classYearId={classYearId} sections={sections}
          onClose={() => setShowAdd(false)} onDone={() => { setShowAdd(false); fetchSubjects() }} />
      )}
      {editId && (
        <EditSubjectForm classYearId={classYearId} subject={subjects.find(s => s.id === editId)!}
          onClose={() => setEditId(null)} onDone={() => { setEditId(null); fetchSubjects() }} />
      )}
    </div>
  )
}

/* ── Add Subject Form ── */
function AddSubjectForm({ classYearId, sections, onClose, onDone }: {
  classYearId: string; sections?: { id: string; name: string }[]
  onClose: () => void; onDone: () => void
}) {
  const { apiParam } = useInstitutionId()
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [periods, setPeriods] = useState(5)
  const [teacherId, setTeacherId] = useState('')
  const [sectionId, setSectionId] = useState('')
  const [online, setOnline] = useState(false)
  const [teachers, setTeachers] = useState<{ id: string; email: string }[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch(`/api/school/people${apiParam}`).then(async r => {
      if (r.ok) {
        const data = await r.json()
        const list: { id: string; email: string; portalType: string }[] = data.users ?? []
        setTeachers(list.filter(u => u.portalType === 'TEACHER').map(u => ({ id: u.id, email: u.email })))
      }
    }).catch(() => {})
  }, [])

  const handleSubmit = async () => {
    if (!name || !teacherId) { toast.error('Name and teacher are required'); return }
    setSaving(true)
    const res = await fetch(`/api/school/classes/${classYearId}/subjects${apiParam}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, code: code || undefined, weeklyPeriods: periods, teacherId, sectionId: sectionId || undefined, hasOnlineContent: online }),
    })
    if (res.ok) { toast.success(`${name} created`); onDone() }
    else { const e = await res.json(); toast.error(e.error ?? 'Failed') }
    setSaving(false)
  }

  return (
    <Overlay title="Add Subject" onClose={onClose}>
      <div className="space-y-3">
        <Field label="Name"><Input value={name} onChange={e => setName(e.target.value)} placeholder="Mathematics" className="min-h-[44px]" /></Field>
        <Field label="Code"><Input value={code} onChange={e => setCode(e.target.value)} placeholder="MATH8" className="min-h-[44px]" /></Field>
        <Field label="Weekly Periods"><Input type="number" min={1} max={10} value={periods} onChange={e => setPeriods(Number(e.target.value))} className="min-h-[44px]" /></Field>
        <Field label="Primary Teacher">
          <select value={teacherId} onChange={e => setTeacherId(e.target.value)}
            className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
            <option value="">Select teacher</option>
            {teachers.map(t => <option key={t.id} value={t.id}>{t.email}</option>)}
          </select>
        </Field>
        {sections && sections.length > 0 && (
          <Field label="Section">
            <select value={sectionId} onChange={e => setSectionId(e.target.value)}
              className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
              <option value="">All Sections</option>
              {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </Field>
        )}
        <label className="flex items-center gap-2 min-h-[44px] cursor-pointer">
          <input type="checkbox" checked={online} onChange={e => setOnline(e.target.checked)} className="h-4 w-4 accent-primary" />
          <span className="text-sm">Has Online Content</span>
        </label>
        <Button className="w-full min-h-[44px]" disabled={saving} onClick={handleSubmit}>
          {saving ? 'Creating...' : 'Create Subject'}
        </Button>
      </div>
    </Overlay>
  )
}

/* ── Edit Subject Form ── */
function EditSubjectForm({ classYearId, subject, onClose, onDone }: {
  classYearId: string; subject: SubjectData; onClose: () => void; onDone: () => void
}) {
  const { apiParam } = useInstitutionId()
  const [name, setName] = useState(subject.name)
  const [code, setCode] = useState(subject.code ?? '')
  const [periods, setPeriods] = useState(subject.weeklyPeriods)
  const [online, setOnline] = useState(subject.hasOnlineContent)
  const [saving, setSaving] = useState(false)

  const handleSubmit = async () => {
    if (!name) { toast.error('Name is required'); return }
    setSaving(true)
    const res = await fetch(`/api/school/classes/${classYearId}/subjects/${subject.id}${apiParam}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, code: code || undefined, weeklyPeriods: periods, hasOnlineContent: online }),
    })
    if (res.ok) { toast.success('Subject updated'); onDone() }
    else { const e = await res.json(); toast.error(e.error ?? 'Failed') }
    setSaving(false)
  }

  return (
    <Overlay title={`Edit ${subject.name}`} onClose={onClose}>
      <div className="space-y-3">
        <Field label="Name"><Input value={name} onChange={e => setName(e.target.value)} className="min-h-[44px]" /></Field>
        <Field label="Code"><Input value={code} onChange={e => setCode(e.target.value)} className="min-h-[44px]" /></Field>
        <Field label="Weekly Periods"><Input type="number" min={1} max={10} value={periods} onChange={e => setPeriods(Number(e.target.value))} className="min-h-[44px]" /></Field>
        <label className="flex items-center gap-2 min-h-[44px] cursor-pointer">
          <input type="checkbox" checked={online} onChange={e => setOnline(e.target.checked)} className="h-4 w-4 accent-primary" />
          <span className="text-sm">Has Online Content</span>
        </label>
        <Button className="w-full min-h-[44px]" disabled={saving} onClick={handleSubmit}>
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </Overlay>
  )
}

/* ── Shared helpers ── */
function Overlay({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/50" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-background border-l shadow-xl flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">{title}</h2>
          <Button variant="ghost" size="icon" className="h-9 w-9" onClick={onClose}><X className="h-4 w-4" /></Button>
        </div>
        <div className="p-4 flex-1 overflow-y-auto">{children}</div>
      </div>
    </>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="text-sm font-medium mb-1 block">{label}</label>{children}</div>
}
