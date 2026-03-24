'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { X } from 'lucide-react'
import { createDocument } from '@/features/documents/actions/documentActions'

const DOC_TYPES = [
    { value: 'TRANSFER_CERTIFICATE', label: 'Transfer Certificate' },
    { value: 'ADMISSION_FORM', label: 'Admission Form' },
    { value: 'MARKSHEET', label: 'Marksheet' },
    { value: 'ID_PROOF', label: 'ID Proof' },
    { value: 'MEDICAL_RECORD', label: 'Medical Record' },
    { value: 'STAFF_CONTRACT', label: 'Staff Contract' },
    { value: 'OTHER', label: 'Other' },
] as const

interface Props {
    institutionId: string
    onClose: () => void
}

export function UploadDocumentForm({ institutionId, onClose }: Props) {
    const [isPending, startTransition] = useTransition()
    const [name, setName] = useState('')
    const [type, setType] = useState<string>('OTHER')
    const [fileUrl, setFileUrl] = useState('')
    const [studentId, setStudentId] = useState('')

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        startTransition(async () => {
            await createDocument({
                institutionId,
                name,
                type: type as Parameters<typeof createDocument>[0]['type'],
                fileUrl,
                fileSize: 0,
                mimeType: 'application/pdf',
                studentId: studentId || undefined,
            })
            onClose()
        })
    }

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-background rounded-xl border w-full max-w-md p-6 space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-lg">Upload Document</h2>
                    <button onClick={onClose}><X className="h-4 w-4" /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1">
                        <Label>Document Name</Label>
                        <Input value={name} onChange={(e) => setName(e.target.value)} required />
                    </div>
                    <div className="space-y-1">
                        <Label>Type</Label>
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                            {DOC_TYPES.map((t) => (
                                <option key={t.value} value={t.value}>{t.label}</option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-1">
                        <Label>File URL</Label>
                        <Input
                            placeholder="https://... (S3 upload in Phase 4)"
                            value={fileUrl}
                            onChange={(e) => setFileUrl(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-1">
                        <Label>Student ID (optional)</Label>
                        <Input value={studentId} onChange={(e) => setStudentId(e.target.value)} placeholder="Leave blank for staff/general docs" />
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                        <Button type="submit" disabled={isPending}>{isPending ? 'Uploading…' : 'Upload'}</Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
