'use client'

import { useState } from 'react'
import { ArrowLeft, FileText } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { DocumentPreviewModal } from './DocumentPreviewModal'

const DEFAULT_DOC_TYPES = [
    { type: 'BONAFIDE', label: 'Bonafide Certificate', desc: 'Certifies student is currently enrolled' },
    { type: 'ATTENDANCE_CERT', label: 'Attendance Certificate', desc: 'Shows attendance % for current year' },
    { type: 'CHARACTER_CERT', label: 'Character Certificate', desc: 'Confirms good conduct and character' },
    { type: 'FEE_RECEIPT', label: 'Fee Receipt', desc: 'Receipt for most recent fee payment' },
    { type: 'NO_DUES', label: 'No Dues Certificate', desc: 'Confirms no pending dues' },
]

interface Props {
    student: {
        id: string; firstName: string; middleName: string | null; lastName: string
        sisId: string; admissionNo: string
        class: { name: string }; section: { name: string }
    }
    institution: {
        name: string; logoUrl: string | null
        addressLine1: string | null; city: string | null
        state: string | null; pinCode: string | null; phone: string | null
    }
    customDocTypes: string[]
}

export function IssueDocumentClient({ student, institution, customDocTypes }: Props) {
    const [preview, setPreview] = useState<{ type: string; label: string } | null>(null)
    const [issuing, setIssuing] = useState(false)
    const fullName = [student.firstName, student.middleName, student.lastName].filter(Boolean).join(' ')

    const allTypes = [
        ...DEFAULT_DOC_TYPES,
        ...customDocTypes.map(t => ({ type: t, label: t, desc: 'Custom document type' })),
    ]

    async function handleIssue(docType: string, label: string) {
        setIssuing(true)
        const res = await fetch(`/api/school/students/${student.id}/issue-document`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ documentType: docType }),
        })
        if (res.ok) {
            setPreview({ type: docType, label })
            toast.success('Document issued')
        } else {
            toast.error('Failed to issue document')
        }
        setIssuing(false)
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <Link href={`/management/students/${student.id}`}>
                    <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
                </Link>
                <h1 className="text-xl font-bold">Issue Document — {fullName}</h1>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {allTypes.map(doc => (
                    <div key={doc.type} className="rounded-xl border p-4 space-y-3 hover:border-primary/50 transition-colors">
                        <div className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-primary" />
                            <h3 className="font-semibold text-sm">{doc.label}</h3>
                        </div>
                        <p className="text-xs text-muted-foreground">{doc.desc}</p>
                        <Button size="sm" className="w-full min-h-[44px]" disabled={issuing}
                            onClick={() => handleIssue(doc.type, doc.label)}>
                            Preview & Issue
                        </Button>
                    </div>
                ))}
            </div>

            {preview && (
                <DocumentPreviewModal
                    documentType={preview.label}
                    studentName={fullName}
                    student={student}
                    institution={institution}
                    onClose={() => setPreview(null)}
                />
            )}
        </div>
    )
}
