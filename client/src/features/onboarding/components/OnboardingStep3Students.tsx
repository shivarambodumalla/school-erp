'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { X, Plus } from 'lucide-react'
import type { StudentEntry } from '@/features/onboarding/types'

const EMPTY_STUDENT: StudentEntry = { firstName: '', lastName: '', admissionNo: '', dateOfBirth: '', gender: 'MALE', guardianName: '', guardianPhone: '' }

interface Props {
    students: StudentEntry[]
    onChange: (students: StudentEntry[]) => void
}

export function OnboardingStep3Students({ students, onChange }: Props) {
    function updateStudent(i: number, field: keyof StudentEntry, value: string) {
        onChange(students.map((s, idx) => (idx === i ? { ...s, [field]: value } : s)))
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Add your first students</h1>
                <p className="text-muted-foreground mt-1">You can import more later</p>
            </div>
            <div className="space-y-4">
                {students.map((student, i) => (
                    <div key={i} className="rounded-xl border p-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <Badge variant="outline">Student {i + 1}</Badge>
                            {students.length > 1 && (
                                <button onClick={() => onChange(students.filter((_, idx) => idx !== i))}>
                                    <X className="h-4 w-4 text-muted-foreground" />
                                </button>
                            )}
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label>First Name</Label>
                                <Input value={student.firstName} onChange={(e) => updateStudent(i, 'firstName', e.target.value)} />
                            </div>
                            <div className="space-y-1">
                                <Label>Last Name</Label>
                                <Input value={student.lastName} onChange={(e) => updateStudent(i, 'lastName', e.target.value)} />
                            </div>
                            <div className="space-y-1">
                                <Label>Admission No</Label>
                                <Input value={student.admissionNo} onChange={(e) => updateStudent(i, 'admissionNo', e.target.value)} />
                            </div>
                            <div className="space-y-1">
                                <Label>Date of Birth</Label>
                                <Input type="date" value={student.dateOfBirth} onChange={(e) => updateStudent(i, 'dateOfBirth', e.target.value)} />
                            </div>
                            <div className="space-y-1">
                                <Label>Gender</Label>
                                <select
                                    value={student.gender}
                                    onChange={(e) => updateStudent(i, 'gender', e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                >
                                    <option value="MALE">Male</option>
                                    <option value="FEMALE">Female</option>
                                    <option value="OTHER">Other</option>
                                </select>
                            </div>
                            <div className="space-y-1">
                                <Label>Guardian Name</Label>
                                <Input value={student.guardianName} onChange={(e) => updateStudent(i, 'guardianName', e.target.value)} />
                            </div>
                            <div className="col-span-2 space-y-1">
                                <Label>Guardian Phone</Label>
                                <Input value={student.guardianPhone} onChange={(e) => updateStudent(i, 'guardianPhone', e.target.value)} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <Button variant="outline" size="sm" onClick={() => onChange([...students, { ...EMPTY_STUDENT }])}>
                <Plus className="h-4 w-4 mr-1.5" /> Add Another Student
            </Button>
        </div>
    )
}
