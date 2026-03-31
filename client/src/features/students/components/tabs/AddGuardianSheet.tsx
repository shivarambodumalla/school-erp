'use client'

import { useState } from 'react'
import { Loader2, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Portal } from '@/components/ui/portal'
import type { StudentGuardian } from '../../types'

interface Props {
    studentId: string
    guardian: StudentGuardian | null
    hasFather: boolean
    hasMother: boolean
    onClose: () => void
    onSaved: (g: StudentGuardian) => void
}

export function AddGuardianSheet({ studentId, guardian, hasFather, hasMother, onClose, onSaved }: Props) {
    const isEdit = !!guardian
    const [form, setForm] = useState({
        type: guardian?.type ?? 'GUARDIAN',
        relationship: guardian?.relationship ?? '',
        name: guardian?.name ?? '',
        phone: guardian?.phone ?? '',
        alternatePhone: guardian?.alternatePhone ?? '',
        email: guardian?.email ?? '',
        occupation: '',
        annualIncome: '',
        isPrimaryContact: guardian?.isPrimaryContact ?? false,
        isEmergencyContact: guardian?.isEmergencyContact ?? false,
        canLogin: guardian?.canLogin ?? false,
    })
    const [saving, setSaving] = useState(false)

    const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }))

    const fatherDisabled = hasFather && form.type !== 'FATHER' && !isEdit
    const motherDisabled = hasMother && form.type !== 'MOTHER' && !isEdit

    async function handleSubmit() {
        if (!form.name.trim() || !form.phone.trim()) return
        setSaving(true)
        const url = isEdit
            ? `/api/school/students/${studentId}/guardians/${guardian!.id}`
            : `/api/school/students/${studentId}/guardians`
        const res = await fetch(url, {
            method: isEdit ? 'PATCH' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...form,
                alternatePhone: form.alternatePhone || null,
                email: form.email || null,
                relationship: form.type === 'GUARDIAN' ? form.relationship || null : null,
            }),
        })
        if (res.ok) {
            const saved = await res.json()
            toast.success(isEdit ? 'Guardian updated' : 'Guardian added')
            onSaved(saved)
        } else {
            const err = await res.json()
            toast.error(err.error ?? 'Failed to save')
        }
        setSaving(false)
    }

    return (
        <Portal>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-background rounded-xl border shadow-lg w-full max-w-lg p-6 space-y-4 max-h-[85vh] overflow-y-auto">
                <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{isEdit ? 'Edit' : 'Add'} Guardian</h3>
                    <button onClick={onClose} className="p-1 rounded hover:bg-muted"><X className="h-4 w-4" /></button>
                </div>
                <div className="space-y-3">
                    <div className="space-y-1.5">
                        <Label>Type *</Label>
                        <select value={form.type} onChange={e => set('type', e.target.value)}
                            className="w-full h-11 rounded-md border border-input bg-background px-3 text-sm">
                            <option value="FATHER" disabled={fatherDisabled}>
                                Father {fatherDisabled ? '(already added)' : ''}
                            </option>
                            <option value="MOTHER" disabled={motherDisabled}>
                                Mother {motherDisabled ? '(already added)' : ''}
                            </option>
                            <option value="GUARDIAN">Guardian</option>
                        </select>
                    </div>
                    {form.type === 'GUARDIAN' && (
                        <Field label="Relationship" value={form.relationship} onChange={v => set('relationship', v)}
                            placeholder="e.g. Uncle, Grandparent" />
                    )}
                    <Field label="Name *" value={form.name} onChange={v => set('name', v)} />
                    <Field label="Phone *" value={form.phone} onChange={v => set('phone', v)} />
                    <Field label="Alternate Phone" value={form.alternatePhone} onChange={v => set('alternatePhone', v)} />
                    <Field label="Email" value={form.email} onChange={v => set('email', v)} type="email" />
                    <div className="flex items-center justify-between py-1">
                        <Label>Primary Contact</Label>
                        <Switch checked={form.isPrimaryContact} onCheckedChange={v => set('isPrimaryContact', v)} />
                    </div>
                    <div className="flex items-center justify-between py-1">
                        <Label>Emergency Contact</Label>
                        <Switch checked={form.isEmergencyContact} onCheckedChange={v => set('isEmergencyContact', v)} />
                    </div>
                    <div className="flex items-center justify-between py-1">
                        <Label>Can Login (Parent Portal)</Label>
                        <Switch checked={form.canLogin} onCheckedChange={v => set('canLogin', v)} />
                    </div>
                    {form.canLogin && !form.email && (
                        <p className="text-xs text-destructive">Email required for login access</p>
                    )}
                </div>
                <div className="flex justify-end gap-2 pt-2">
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={saving || !form.name.trim() || !form.phone.trim()}>
                        {saving && <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />}
                        {isEdit ? 'Update' : 'Add'} Guardian
                    </Button>
                </div>
            </div>
            </div>
        </Portal>
    )
}

function Field({ label, value, onChange, placeholder, type }: {
    label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string
}) {
    return (
        <div className="space-y-1.5">
            <Label>{label}</Label>
            <Input value={value} onChange={e => onChange(e.target.value)}
                placeholder={placeholder} type={type} className="min-h-[44px]" />
        </div>
    )
}
