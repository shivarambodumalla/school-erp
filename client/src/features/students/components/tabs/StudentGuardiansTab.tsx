'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GuardianCard } from './GuardianCard'
import { AddGuardianSheet } from './AddGuardianSheet'
import type { StudentGuardian } from '../../types'

interface Props {
    studentId: string
    guardians: StudentGuardian[]
}

export function StudentGuardiansTab({ studentId, guardians: initial }: Props) {
    const [guardians, setGuardians] = useState(initial)
    const [showAdd, setShowAdd] = useState(false)
    const [editGuardian, setEditGuardian] = useState<StudentGuardian | null>(null)

    const hasFather = guardians.some(g => g.type === 'FATHER')
    const hasMother = guardians.some(g => g.type === 'MOTHER')

    function handleAdded(g: StudentGuardian) {
        setGuardians(prev => [...prev, g])
        setShowAdd(false)
    }

    function handleUpdated(g: StudentGuardian) {
        setGuardians(prev => prev.map(x => x.id === g.id ? g : x))
        setEditGuardian(null)
    }

    function handleRemoved(id: string) {
        setGuardians(prev => prev.filter(g => g.id !== id))
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm">
                    Guardians ({guardians.length})
                </h3>
                <Button size="sm" className="min-h-[44px]" onClick={() => setShowAdd(true)}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Guardian
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {guardians.map(g => (
                    <GuardianCard
                        key={g.id}
                        guardian={g}
                        studentId={studentId}
                        onEdit={() => setEditGuardian(g)}
                        onRemoved={() => handleRemoved(g.id)}
                    />
                ))}
            </div>

            {guardians.length === 0 && (
                <div className="rounded-lg border bg-muted/30 p-8 text-center">
                    <p className="text-sm text-muted-foreground">No guardians added yet</p>
                </div>
            )}

            {(showAdd || editGuardian) && (
                <AddGuardianSheet
                    studentId={studentId}
                    guardian={editGuardian}
                    hasFather={hasFather}
                    hasMother={hasMother}
                    onClose={() => { setShowAdd(false); setEditGuardian(null) }}
                    onSaved={editGuardian ? handleUpdated : handleAdded}
                />
            )}
        </div>
    )
}
