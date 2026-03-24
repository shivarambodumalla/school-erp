'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { X, Plus } from 'lucide-react'
import type { ClassEntry } from '@/features/onboarding/types'

const EMPTY_CLASS: ClassEntry = { name: '', gradeLevel: 1, sectionName: 'A' }

interface Props {
    classes: ClassEntry[]
    onChange: (classes: ClassEntry[]) => void
}

export function OnboardingStep1Classes({ classes, onChange }: Props) {
    function updateClass(i: number, field: keyof ClassEntry, value: string | number) {
        onChange(classes.map((c, idx) => (idx === i ? { ...c, [field]: value } : c)))
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Set up your classes</h1>
                <p className="text-muted-foreground mt-1">Add the classes your school has</p>
            </div>
            <div className="space-y-4">
                {classes.map((cls, i) => (
                    <div key={i} className="rounded-xl border p-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <Badge variant="outline">Class {i + 1}</Badge>
                            {classes.length > 1 && (
                                <button onClick={() => onChange(classes.filter((_, idx) => idx !== i))}>
                                    <X className="h-4 w-4 text-muted-foreground" />
                                </button>
                            )}
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            <div className="col-span-1 space-y-1">
                                <Label>Class Name</Label>
                                <Input value={cls.name} onChange={(e) => updateClass(i, 'name', e.target.value)} placeholder="e.g. Class 1" />
                            </div>
                            <div className="col-span-1 space-y-1">
                                <Label>Grade Level</Label>
                                <Input type="number" min={1} max={12} value={cls.gradeLevel} onChange={(e) => updateClass(i, 'gradeLevel', parseInt(e.target.value))} />
                            </div>
                            <div className="col-span-1 space-y-1">
                                <Label>Section</Label>
                                <Input value={cls.sectionName} onChange={(e) => updateClass(i, 'sectionName', e.target.value)} placeholder="A" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <Button variant="outline" size="sm" onClick={() => onChange([...classes, { ...EMPTY_CLASS }])}>
                <Plus className="h-4 w-4 mr-1.5" /> Add Another Class
            </Button>
        </div>
    )
}
