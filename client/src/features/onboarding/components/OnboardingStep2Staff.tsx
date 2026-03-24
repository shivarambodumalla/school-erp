'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { X, Plus } from 'lucide-react'
import type { StaffEntry } from '@/features/onboarding/types'

const EMPTY_STAFF: StaffEntry = { firstName: '', lastName: '', email: '', portalType: 'TEACHER', password: 'Demo@1234' }

interface Props {
    staff: StaffEntry[]
    onChange: (staff: StaffEntry[]) => void
}

export function OnboardingStep2Staff({ staff, onChange }: Props) {
    function updateStaff(i: number, field: keyof StaffEntry, value: string) {
        onChange(staff.map((s, idx) => (idx === i ? { ...s, [field]: value } : s)))
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Add your first staff member</h1>
                <p className="text-muted-foreground mt-1">You can add more later</p>
            </div>
            <div className="space-y-4">
                {staff.map((member, i) => (
                    <div key={i} className="rounded-xl border p-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <Badge variant="outline">Staff {i + 1}</Badge>
                            {staff.length > 1 && (
                                <button onClick={() => onChange(staff.filter((_, idx) => idx !== i))}>
                                    <X className="h-4 w-4 text-muted-foreground" />
                                </button>
                            )}
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label>First Name</Label>
                                <Input value={member.firstName} onChange={(e) => updateStaff(i, 'firstName', e.target.value)} />
                            </div>
                            <div className="space-y-1">
                                <Label>Last Name</Label>
                                <Input value={member.lastName} onChange={(e) => updateStaff(i, 'lastName', e.target.value)} />
                            </div>
                            <div className="col-span-2 space-y-1">
                                <Label>Email</Label>
                                <Input type="email" value={member.email} onChange={(e) => updateStaff(i, 'email', e.target.value)} />
                            </div>
                            <div className="space-y-1">
                                <Label>Role</Label>
                                <select
                                    value={member.portalType}
                                    onChange={(e) => updateStaff(i, 'portalType', e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                >
                                    <option value="TEACHER">Teacher</option>
                                    <option value="INSTRUCTOR">Instructor</option>
                                </select>
                            </div>
                            <div className="space-y-1">
                                <Label>Temp Password</Label>
                                <Input value={member.password} onChange={(e) => updateStaff(i, 'password', e.target.value)} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <Button variant="outline" size="sm" onClick={() => onChange([...staff, { ...EMPTY_STAFF }])}>
                <Plus className="h-4 w-4 mr-1.5" /> Add Another Staff
            </Button>
        </div>
    )
}
