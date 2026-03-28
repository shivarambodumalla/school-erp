'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Save } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { idProofTypesSchema, type IdProofTypesData } from '../schemas/admissionSettingsSchema'

const ID_PROOF_OPTIONS = [
    { value: 'AADHAAR', label: 'Aadhaar Card' },
    { value: 'PASSPORT', label: 'Passport' },
    { value: 'BIRTH_CERTIFICATE', label: 'Birth Certificate' },
    { value: 'VOTER_ID', label: 'Voter ID (parent)' },
    { value: 'DRIVING_LICENCE', label: 'Driving Licence (parent)' },
    { value: 'RATION_CARD', label: 'Ration Card' },
    { value: 'OTHER', label: 'Other' },
]

interface Props {
    acceptedTypes: string[]
}

export function IdProofTypesCard({ acceptedTypes }: Props) {
    const form = useForm<IdProofTypesData>({
        resolver: zodResolver(idProofTypesSchema),
        defaultValues: { acceptedIdProofTypes: acceptedTypes },
    })

    const selected = form.watch('acceptedIdProofTypes')
    const error = form.formState.errors.acceptedIdProofTypes?.message

    function toggle(value: string) {
        const current = form.getValues('acceptedIdProofTypes')
        const next = current.includes(value)
            ? current.filter(v => v !== value)
            : [...current, value]
        form.setValue('acceptedIdProofTypes', next, { shouldValidate: true })
    }

    async function onSubmit(data: IdProofTypesData) {
        const res = await fetch('/api/school/settings/admissions', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        })
        if (res.ok) {
            toast.success('ID proof types saved')
        } else {
            const err = await res.json()
            toast.error(err.error ?? 'Failed to save')
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>ID Proof Verification</CardTitle>
                <CardDescription>
                    Which ID documents do you accept from students
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {ID_PROOF_OPTIONS.map(opt => (
                            <label
                                key={opt.value}
                                className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer
                                           hover:bg-muted/50 transition-colors min-h-[44px]"
                            >
                                <Checkbox
                                    checked={selected.includes(opt.value)}
                                    onCheckedChange={() => toggle(opt.value)}
                                />
                                <Label className="cursor-pointer text-sm">{opt.label}</Label>
                            </label>
                        ))}
                    </div>
                    {error && (
                        <p className="text-sm text-destructive">{error}</p>
                    )}
                    <div className="flex justify-end">
                        <Button
                            type="submit"
                            disabled={form.formState.isSubmitting || !!error}
                            className="min-h-[44px]"
                        >
                            <Save className="h-4 w-4 mr-2" />
                            {form.formState.isSubmitting ? 'Saving...' : 'Save'}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}
