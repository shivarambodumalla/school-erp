'use client'

import { useState } from 'react'
import { Pencil, Plus, X, Save } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { StudentProfile } from '../../types'

interface MedicalCondition {
    name: string
    severity: string
    notes: string
}

const SEVERITY_STYLES: Record<string, string> = {
    MILD: 'bg-green-100 text-green-700',
    MODERATE: 'bg-amber-100 text-amber-700',
    SEVERE: 'bg-red-100 text-red-700',
}

interface Props {
    student: StudentProfile
    onUpdated: (s: StudentProfile) => void
}

export function HealthCard({ student, onUpdated }: Props) {
    const [editing, setEditing] = useState(false)
    const [allergies, setAllergies] = useState<string[]>(student.allergies)
    const [newAllergy, setNewAllergy] = useState('')
    const conditions = (student.medicalConditions ?? []) as MedicalCondition[]
    const [doctorName, setDoctorName] = useState(student.emergencyDoctorName ?? '')
    const [doctorPhone, setDoctorPhone] = useState(student.emergencyDoctorPhone ?? '')
    const [saving, setSaving] = useState(false)

    async function handleSave() {
        setSaving(true)
        const res = await fetch(`/api/school/students/${student.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                allergies,
                emergencyDoctorName: doctorName || null,
                emergencyDoctorPhone: doctorPhone || null,
            }),
        })
        if (res.ok) {
            const updated = await res.json()
            toast.success('Health details updated')
            onUpdated(updated)
            setEditing(false)
        } else {
            toast.error('Failed to save')
        }
        setSaving(false)
    }

    function addAllergy() {
        if (!newAllergy.trim()) return
        setAllergies(prev => [...prev, newAllergy.trim()])
        setNewAllergy('')
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-sm">Health Information</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => editing ? handleSave() : setEditing(true)}>
                    {editing ? (saving ? 'Saving...' : <><Save className="h-3.5 w-3.5 mr-1" />Save</>) :
                        <><Pencil className="h-3.5 w-3.5 mr-1" />Edit</>}
                </Button>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <Label className="text-xs text-muted-foreground">Allergies</Label>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                        {allergies.map((a, i) => (
                            <span key={i} className="px-2 py-0.5 rounded-full text-xs bg-red-100 text-red-700 flex items-center gap-1">
                                {a}
                                {editing && (
                                    <button onClick={() => setAllergies(prev => prev.filter((_, j) => j !== i))}>
                                        <X className="h-3 w-3" />
                                    </button>
                                )}
                            </span>
                        ))}
                        {allergies.length === 0 && !editing && (
                            <span className="text-xs text-muted-foreground">None recorded</span>
                        )}
                    </div>
                    {editing && (
                        <div className="flex gap-2 mt-2">
                            <Input value={newAllergy} onChange={e => setNewAllergy(e.target.value)}
                                placeholder="Add allergy" className="h-8 text-sm"
                                onKeyDown={e => e.key === 'Enter' && addAllergy()} />
                            <Button size="sm" variant="outline" className="h-8" onClick={addAllergy}>
                                <Plus className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    )}
                </div>

                <div>
                    <Label className="text-xs text-muted-foreground">Medical Conditions</Label>
                    {conditions.length > 0 ? (
                        <div className="space-y-1.5 mt-1">
                            {conditions.map((c, i) => (
                                <div key={i} className="flex items-center gap-2 text-sm">
                                    <span className="font-medium">{c.name}</span>
                                    <span className={`px-1.5 py-0.5 rounded text-xs ${SEVERITY_STYLES[c.severity] ?? ''}`}>
                                        {c.severity}
                                    </span>
                                    {c.notes && <span className="text-muted-foreground">— {c.notes}</span>}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-xs text-muted-foreground mt-1">None recorded</p>
                    )}
                </div>

                <div>
                    <Label className="text-xs text-muted-foreground">Emergency Doctor</Label>
                    {editing ? (
                        <div className="grid grid-cols-2 gap-2 mt-1">
                            <Input value={doctorName} onChange={e => setDoctorName(e.target.value)}
                                placeholder="Doctor name" className="h-8 text-sm" />
                            <Input value={doctorPhone} onChange={e => setDoctorPhone(e.target.value)}
                                placeholder="Phone" className="h-8 text-sm" />
                        </div>
                    ) : (
                        <p className="text-sm mt-1">
                            {doctorName ? `${doctorName} — ${doctorPhone}` : <span className="text-muted-foreground">Not set</span>}
                        </p>
                    )}
                </div>

                <div className="rounded-lg bg-muted/30 p-3">
                    <p className="text-xs text-muted-foreground">Vaccination tracking coming soon</p>
                </div>
            </CardContent>
        </Card>
    )
}
