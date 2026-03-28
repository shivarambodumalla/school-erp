'use client'

import { useState } from 'react'
import { Phone, Shield, LogIn, Trash2, Plus, Clock, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

interface Guardian {
  id: string; type: string; name: string; phone: string
  email: string | null; relationship: string | null
  isPrimaryContact: boolean; isEmergencyContact: boolean; canLogin: boolean
}

interface Admission {
  id: string; firstName: string; middleName: string | null
  lastName: string; dateOfBirth: string; gender: string
  bloodGroup: string | null; nationality: string | null
  religion: string | null; motherTongue: string | null
  admissionType: string; previousSchoolName: string | null
  previousClass: string | null; previousTCNumber: string | null
  appliedAt: string; admittedAt: string | null
  enrolledAt: string | null; rejectedAt: string | null
  guardians: Guardian[]
  documents: Array<{ id: string; documentTypeName: string; fileUrl: string; fileName: string; isVerified: boolean; createdAt: string }>
}

interface AuditEntry { action: string; after: unknown; createdAt: string }

interface Props {
  admission: Admission
  auditLogs: AuditEntry[]
  onGuardiansChange: (gs: Guardian[]) => void
}

export function AdmissionDetailsTabs({ admission, auditLogs, onGuardiansChange }: Props) {
  return (
    <div className="rounded-xl border divide-y">
      {/* Personal Details */}
      <CollapsibleSection title="Personal Details" defaultOpen>
        <DetailsSection admission={admission} />
      </CollapsibleSection>

      {/* Guardians */}
      <CollapsibleSection title={`Guardians (${admission.guardians.length})`} defaultOpen>
        <GuardiansSection
          admissionId={admission.id}
          guardians={admission.guardians}
          onChange={onGuardiansChange}
        />
      </CollapsibleSection>

      {/* Documents */}
      <CollapsibleSection title={`Documents (${admission.documents.length})`}>
        <DocumentsSection documents={admission.documents} />
      </CollapsibleSection>

      {/* Timeline */}
      <CollapsibleSection title="Timeline">
        <TimelineSection admission={admission} auditLogs={auditLogs} />
      </CollapsibleSection>
    </div>
  )
}

/* ── Collapsible section ── */

function CollapsibleSection({ title, defaultOpen, children }: {
  title: string; defaultOpen?: boolean; children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen ?? false)
  return (
    <div>
      <button type="button" onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-3 hover:bg-muted/30 transition-colors">
        <h3 className="text-sm font-semibold">{title}</h3>
        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="px-5 pb-4">{children}</div>}
    </div>
  )
}

/* ── Details ── */

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="text-sm">{value || '—'}</p>
    </div>
  )
}

function DetailsSection({ admission: a }: { admission: Admission }) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-3">
        <Field label="First Name" value={a.firstName} />
        <Field label="Middle Name" value={a.middleName} />
        <Field label="Last Name" value={a.lastName} />
        <Field label="Date of Birth" value={new Date(a.dateOfBirth).toLocaleDateString('en-IN')} />
        <Field label="Gender" value={a.gender} />
        <Field label="Blood Group" value={a.bloodGroup} />
        <Field label="Nationality" value={a.nationality} />
        <Field label="Religion" value={a.religion} />
        <Field label="Mother Tongue" value={a.motherTongue} />
        <Field label="Type" value={a.admissionType} />
      </div>
      {a.admissionType === 'TRANSFER' && (
        <div className="grid grid-cols-3 gap-x-4 gap-y-3 rounded-lg bg-muted/30 p-3">
          <Field label="Previous School" value={a.previousSchoolName} />
          <Field label="Previous Class" value={a.previousClass} />
          <Field label="TC Number" value={a.previousTCNumber} />
        </div>
      )}
    </div>
  )
}

/* ── Guardians ── */

function GuardiansSection({
  admissionId, guardians, onChange,
}: {
  admissionId: string; guardians: Guardian[]
  onChange: (gs: Guardian[]) => void
}) {
  const [adding, setAdding] = useState(false)

  async function handleDelete(gId: string) {
    const res = await fetch(`/api/school/admissions/${admissionId}/guardians/${gId}`, {
      method: 'DELETE',
    })
    if (res.ok) {
      onChange(guardians.filter(g => g.id !== gId))
      toast.success('Guardian removed')
    }
  }

  async function handleAdd(data: { type: string; name: string; phone: string; email: string }) {
    const res = await fetch(`/api/school/admissions/${admissionId}/guardians`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (res.ok) {
      const g = await res.json()
      onChange([...guardians, g])
      setAdding(false)
      toast.success('Guardian added')
    } else {
      const err = await res.json()
      toast.error(err.error)
    }
  }

  return (
    <div className="space-y-2">
      {guardians.length === 0 ? (
        <p className="text-sm text-muted-foreground">No guardians on record</p>
      ) : (
        guardians.map(g => (
          <div key={g.id} className="flex items-center justify-between gap-3 py-1.5">
            <div className="flex items-center gap-2 flex-wrap min-w-0">
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-muted shrink-0">
                {g.type}
              </span>
              <span className="text-sm font-medium">{g.name}</span>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Phone className="h-3 w-3" /> {g.phone}
              </span>
              {g.email && <span className="text-xs text-muted-foreground">{g.email}</span>}
              {g.isPrimaryContact && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">Primary</span>
              )}
              {g.isEmergencyContact && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 flex items-center gap-0.5">
                  <Shield className="h-2.5 w-2.5" /> Emergency
                </span>
              )}
              {g.canLogin && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-100 text-green-700 flex items-center gap-0.5">
                  <LogIn className="h-2.5 w-2.5" /> Portal
                </span>
              )}
            </div>
            <button onClick={() => handleDelete(g.id)}
              className="p-1 rounded hover:bg-red-100 text-red-500 shrink-0">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))
      )}

      {adding ? (
        <InlineGuardianForm onAdd={handleAdd} onCancel={() => setAdding(false)} />
      ) : (
        <Button variant="outline" size="sm" onClick={() => setAdding(true)} className="mt-1">
          <Plus className="h-4 w-4 mr-1" /> Add Guardian
        </Button>
      )}
    </div>
  )
}

function InlineGuardianForm({
  onAdd, onCancel,
}: {
  onAdd: (d: { type: string; name: string; phone: string; email: string }) => void
  onCancel: () => void
}) {
  const [type, setType] = useState('FATHER')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')

  return (
    <div className="rounded-lg border bg-muted/30 p-4 space-y-3 mt-2">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="space-y-1">
          <Label>Type</Label>
          <select value={type} onChange={e => setType(e.target.value)}
            className="w-full h-11 rounded-md border border-input bg-background px-3 text-sm">
            <option value="FATHER">Father</option>
            <option value="MOTHER">Mother</option>
            <option value="GUARDIAN">Guardian</option>
          </select>
        </div>
        <div className="space-y-1">
          <Label>Name *</Label>
          <Input value={name} onChange={e => setName(e.target.value)} className="min-h-[44px]" />
        </div>
        <div className="space-y-1">
          <Label>Phone *</Label>
          <Input value={phone} onChange={e => setPhone(e.target.value)} className="min-h-[44px]" />
        </div>
        <div className="space-y-1">
          <Label>Email</Label>
          <Input value={email} onChange={e => setEmail(e.target.value)} className="min-h-[44px]" />
        </div>
      </div>
      <div className="flex gap-2">
        <Button size="sm" onClick={() => onAdd({ type, name, phone, email })}
          disabled={!name || !phone}>Add</Button>
        <Button size="sm" variant="ghost" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  )
}

/* ── Documents ── */

function DocumentsSection({ documents }: { documents: Admission['documents'] }) {
  if (documents.length === 0) {
    return <p className="text-sm text-muted-foreground">No documents uploaded yet</p>
  }
  return (
    <div className="space-y-1.5">
      {documents.map(d => (
        <div key={d.id} className="flex items-center justify-between py-1.5">
          <div>
            <p className="text-sm">{d.documentTypeName}</p>
            <p className="text-xs text-muted-foreground">{d.fileName}</p>
          </div>
          {d.isVerified ? (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-100 text-green-700">Verified</span>
          ) : (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">Pending</span>
          )}
        </div>
      ))}
    </div>
  )
}

/* ── Timeline ── */

function TimelineSection({ admission: a, auditLogs }: { admission: Admission; auditLogs: AuditEntry[] }) {
  const [showAudit, setShowAudit] = useState(false)

  const events = [
    { label: 'Application Submitted', date: a.appliedAt },
    ...(a.admittedAt ? [{ label: 'Admitted', date: a.admittedAt }] : []),
    ...(a.enrolledAt ? [{ label: 'Enrolled', date: a.enrolledAt }] : []),
    ...(a.rejectedAt ? [{ label: 'Rejected', date: a.rejectedAt }] : []),
  ]

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-4">
        {events.map((e, i) => (
          <div key={i} className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 text-primary shrink-0" />
            <div>
              <span className="text-sm font-medium">{e.label}</span>
              <span className="text-xs text-muted-foreground ml-1.5">
                {new Date(e.date).toLocaleDateString('en-IN', {
                  day: 'numeric', month: 'short', year: 'numeric',
                })}
              </span>
            </div>
          </div>
        ))}
      </div>

      {auditLogs.length > 0 && (
        <>
          <button type="button" onClick={() => setShowAudit(prev => !prev)}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showAudit ? 'rotate-180' : ''}`} />
            Audit Log ({auditLogs.length})
          </button>
          {showAudit && (
            <div className="space-y-1 pl-5">
              {auditLogs.map((log, i) => (
                <div key={i} className="flex items-center gap-2 py-1">
                  <div className="h-1 w-1 rounded-full bg-muted-foreground shrink-0" />
                  <span className="text-xs">{log.action}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(log.createdAt).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
