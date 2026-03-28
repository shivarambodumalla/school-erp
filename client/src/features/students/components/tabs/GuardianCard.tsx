'use client'

import { Pencil, Trash2, Phone, Mail } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { StudentGuardian } from '../../types'

const TYPE_STYLES: Record<string, string> = {
    FATHER: 'bg-blue-100 text-blue-700',
    MOTHER: 'bg-pink-100 text-pink-700',
    GUARDIAN: 'bg-gray-100 text-gray-700',
}

interface Props {
    guardian: StudentGuardian
    studentId: string
    onEdit: () => void
    onRemoved: () => void
}

export function GuardianCard({ guardian: g, studentId, onEdit, onRemoved }: Props) {
    async function handleRemove() {
        if (!confirm(`Remove ${g.name}?`)) return
        const res = await fetch(`/api/school/students/${studentId}/guardians/${g.id}`, {
            method: 'DELETE',
        })
        if (res.ok) {
            toast.success('Guardian removed')
            onRemoved()
        } else {
            toast.error('Failed to remove')
        }
    }

    return (
        <Card>
            <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                    <div>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${TYPE_STYLES[g.type] ?? TYPE_STYLES.GUARDIAN}`}>
                            {g.type}
                        </span>
                        {g.relationship && (
                            <span className="ml-1.5 text-xs text-muted-foreground">({g.relationship})</span>
                        )}
                    </div>
                    <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onEdit}>
                            <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={handleRemove}>
                            <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                </div>
                <p className="font-semibold">{g.name}</p>
                <div className="space-y-1 text-sm text-muted-foreground">
                    <p className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> {g.phone}</p>
                    {g.alternatePhone && <p className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> {g.alternatePhone}</p>}
                    {g.email && <p className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> {g.email}</p>}
                </div>
                <div className="flex flex-wrap gap-1.5">
                    {g.isPrimaryContact && (
                        <span className="px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700">Primary</span>
                    )}
                    {g.isEmergencyContact && (
                        <span className="px-2 py-0.5 rounded-full text-xs bg-red-100 text-red-700">Emergency</span>
                    )}
                    <span className={`px-2 py-0.5 rounded-full text-xs ${g.canLogin ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        Login {g.canLogin ? 'enabled' : 'disabled'}
                    </span>
                </div>
            </CardContent>
        </Card>
    )
}
