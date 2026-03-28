'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Save } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { numberFormatsSchema, type NumberFormatsData } from '../schemas/admissionSettingsSchema'

interface Props {
    settings: NumberFormatsData
}

export function NumberFormatsCard({ settings }: Props) {
    const form = useForm<NumberFormatsData>({
        resolver: zodResolver(numberFormatsSchema),
        defaultValues: settings,
    })

    const w = form.watch()
    const year = new Date().getFullYear()
    const admPreview = `${w.admissionNoPrefix}${w.admissionNoCurrentSeq}`
    const rollPreview = w.rollNoPrefix
        ? `${w.rollNoPrefix}${w.rollNoCurrentSeq}`
        : String(w.rollNoCurrentSeq)
    const appPreview = `${w.appNoPrefix}-${year}-${String(w.appNoCurrentSeq).padStart(3, '0')}`

    async function onSubmit(data: NumberFormatsData) {
        const res = await fetch('/api/school/settings/admissions', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        })
        if (res.ok) {
            toast.success('Number formats saved')
        } else {
            const err = await res.json()
            toast.error(err.error ?? 'Failed to save')
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Auto-numbering</CardTitle>
                <CardDescription>
                    Configure how admission and roll numbers are generated
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <NumberRow
                        label="Admission Number"
                        prefixField="admissionNoPrefix"
                        seqField="admissionNoCurrentSeq"
                        preview={admPreview}
                        form={form}
                    />
                    <NumberRow
                        label="Roll Number"
                        prefixField="rollNoPrefix"
                        seqField="rollNoCurrentSeq"
                        preview={rollPreview}
                        form={form}
                    />
                    <NumberRow
                        label="Application Number"
                        prefixField="appNoPrefix"
                        seqField="appNoCurrentSeq"
                        preview={appPreview}
                        hint="Year auto-inserted between prefix and sequence"
                        form={form}
                    />
                    <div className="flex justify-end">
                        <Button
                            type="submit"
                            disabled={form.formState.isSubmitting}
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

function NumberRow({ label, prefixField, seqField, preview, hint, form }: {
    label: string
    prefixField: keyof NumberFormatsData
    seqField: keyof NumberFormatsData
    preview: string
    hint?: string
    form: ReturnType<typeof useForm<NumberFormatsData>>
}) {
    return (
        <div className="space-y-2">
            <Label className="text-sm font-medium">{label}</Label>
            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">Prefix</span>
                    <Input
                        {...form.register(prefixField)}
                        maxLength={5}
                        className="min-h-[44px]"
                        placeholder="e.g. ADM"
                    />
                </div>
                <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">Starting from</span>
                    <Input
                        type="number"
                        min={1}
                        {...form.register(seqField, { valueAsNumber: true })}
                        className="min-h-[44px]"
                    />
                </div>
            </div>
            <p className="text-xs text-muted-foreground">
                Next: <span className="font-mono font-medium text-foreground">{preview}</span>
                {hint && <span className="ml-2 italic">({hint})</span>}
            </p>
        </div>
    )
}
