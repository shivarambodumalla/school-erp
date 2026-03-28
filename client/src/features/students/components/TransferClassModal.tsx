'use client'

import { useState, useEffect } from 'react'
import { ArrowRightLeft, Loader2, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

interface ClassItem {
    id: string
    name: string
    sections: { id: string; name: string }[]
}

interface Props {
    studentId: string
    currentClassId: string
    onClose: () => void
    onTransferred: () => void
}

export function TransferClassModal({ studentId, currentClassId, onClose, onTransferred }: Props) {
    const [classes, setClasses] = useState<ClassItem[]>([])
    const [classId, setClassId] = useState('')
    const [sectionId, setSectionId] = useState('')
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        fetch('/api/school/classes')
            .then(r => r.json())
            .then(setClasses)
            .catch(() => toast.error('Failed to load classes'))
    }, [])

    const selected = classes.find(c => c.id === classId)

    async function handleTransfer() {
        if (!classId) return
        setSaving(true)
        const res = await fetch(`/api/school/students/${studentId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ classId, sectionId: sectionId || undefined }),
        })
        if (res.ok) {
            toast.success('Student transferred to new class')
            onTransferred()
        } else {
            toast.error('Transfer failed')
        }
        setSaving(false)
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-background rounded-xl border shadow-lg w-full max-w-md p-6 space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Transfer to New Class</h3>
                    <button onClick={onClose} className="p-1 rounded hover:bg-muted">
                        <X className="h-4 w-4" />
                    </button>
                </div>
                <div className="space-y-3">
                    <div className="space-y-1.5">
                        <Label>Class *</Label>
                        <select
                            value={classId}
                            onChange={e => { setClassId(e.target.value); setSectionId('') }}
                            className="w-full h-11 rounded-md border border-input bg-background px-3 text-sm"
                        >
                            <option value="">Select class</option>
                            {classes.filter(c => c.id !== currentClassId).map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                    {selected && selected.sections.length > 0 && (
                        <div className="space-y-1.5">
                            <Label>Section</Label>
                            <select
                                value={sectionId}
                                onChange={e => setSectionId(e.target.value)}
                                className="w-full h-11 rounded-md border border-input bg-background px-3 text-sm"
                            >
                                <option value="">Select section</option>
                                {selected.sections.map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>
                <div className="flex justify-end gap-2 pt-2">
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleTransfer} disabled={!classId || saving}>
                        {saving ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> :
                            <ArrowRightLeft className="h-4 w-4 mr-1.5" />}
                        Transfer
                    </Button>
                </div>
            </div>
        </div>
    )
}
