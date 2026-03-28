'use client'

import { useState } from 'react'
import { Pencil, Save } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { StudentProfile } from '../../types'

const MODE_STYLES: Record<string, string> = {
    BUS: 'bg-blue-100 text-blue-700',
    PARENT_DROP: 'bg-green-100 text-green-700',
    WALK: 'bg-gray-100 text-gray-600',
    DAY_SCHOLAR: 'bg-gray-100 text-gray-600',
    OTHER: 'bg-gray-100 text-gray-600',
}

const BOARDING_LABELS: Record<string, string> = {
    DAY_SCHOLAR: 'Day Scholar',
    BOARDER: 'Boarder',
}

interface Props {
    student: StudentProfile
    onUpdated: (s: StudentProfile) => void
}

export function TransportCard({ student, onUpdated }: Props) {
    const [editing, setEditing] = useState(false)
    const [form, setForm] = useState({
        transportMode: student.transportMode,
        busRouteId: student.busRouteId ?? '',
        pickupStop: student.pickupStop ?? '',
        dropStop: student.dropStop ?? '',
        boardingType: student.boardingType,
        hostelRoom: student.hostelRoom ?? '',
    })
    const [saving, setSaving] = useState(false)

    const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

    async function handleSave() {
        setSaving(true)
        const res = await fetch(`/api/school/students/${student.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...form,
                busRouteId: form.busRouteId || null,
                pickupStop: form.pickupStop || null,
                dropStop: form.dropStop || null,
                hostelRoom: form.hostelRoom || null,
            }),
        })
        if (res.ok) {
            const updated = await res.json()
            toast.success('Transport details updated')
            onUpdated(updated)
            setEditing(false)
        } else {
            toast.error('Failed to save')
        }
        setSaving(false)
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-sm">Transport & Boarding</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => editing ? handleSave() : setEditing(true)}>
                    {editing ? (saving ? 'Saving...' : <><Save className="h-3.5 w-3.5 mr-1" />Save</>) :
                        <><Pencil className="h-3.5 w-3.5 mr-1" />Edit</>}
                </Button>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <Label className="text-xs text-muted-foreground">Transport Mode</Label>
                    {editing ? (
                        <select value={form.transportMode} onChange={e => set('transportMode', e.target.value)}
                            className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm mt-1">
                            <option value="DAY_SCHOLAR">Day Scholar</option>
                            <option value="BUS">Bus</option>
                            <option value="PARENT_DROP">Parent Drop</option>
                            <option value="WALK">Walk</option>
                            <option value="OTHER">Other</option>
                        </select>
                    ) : (
                        <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${MODE_STYLES[student.transportMode] ?? ''}`}>
                            {student.transportMode.replace('_', ' ')}
                        </span>
                    )}
                </div>

                {(editing ? form.transportMode === 'BUS' : student.transportMode === 'BUS') && (
                    <div className="space-y-2">
                        <Field label="Bus Route" value={editing ? form.busRouteId : student.busRouteId}
                            editing={editing} onChange={v => set('busRouteId', v)} />
                        <Field label="Pickup Stop" value={editing ? form.pickupStop : student.pickupStop}
                            editing={editing} onChange={v => set('pickupStop', v)} />
                        <Field label="Drop Stop" value={editing ? form.dropStop : student.dropStop}
                            editing={editing} onChange={v => set('dropStop', v)} />
                    </div>
                )}

                <div>
                    <Label className="text-xs text-muted-foreground">Boarding Type</Label>
                    {editing ? (
                        <select value={form.boardingType} onChange={e => set('boardingType', e.target.value)}
                            className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm mt-1">
                            <option value="DAY_SCHOLAR">Day Scholar</option>
                            <option value="BOARDER">Boarder</option>
                        </select>
                    ) : (
                        <p className="text-sm mt-1 font-medium">
                            {BOARDING_LABELS[student.boardingType] ?? student.boardingType}
                        </p>
                    )}
                </div>

                {(editing ? form.boardingType === 'BOARDER' : student.boardingType === 'BOARDER') && (
                    <Field label="Hostel Room" value={editing ? form.hostelRoom : student.hostelRoom}
                        editing={editing} onChange={v => set('hostelRoom', v)} />
                )}
            </CardContent>
        </Card>
    )
}

function Field({ label, value, editing, onChange }: {
    label: string; value: string | null | undefined; editing: boolean
    onChange: (v: string) => void
}) {
    return (
        <div>
            <Label className="text-xs text-muted-foreground">{label}</Label>
            {editing ? (
                <Input value={value ?? ''} onChange={e => onChange(e.target.value)}
                    className="h-8 text-sm mt-1" />
            ) : (
                <p className="text-sm mt-1">{value || <span className="text-muted-foreground">—</span>}</p>
            )}
        </div>
    )
}
