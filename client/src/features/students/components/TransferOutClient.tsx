'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'

const EXIT_TYPES = [
    { value: 'TRANSFER', label: 'Transfer to another school' },
    { value: 'GRADUATED', label: 'Graduated' },
    { value: 'WITHDRAWN', label: 'Withdrawn by parent / guardian' },
    { value: 'OTHER', label: 'Other' },
] as const

const DOCUMENT_OPTIONS = [
    { value: 'TRANSFER_CERT', label: 'Transfer Certificate (TC)' },
    { value: 'BONAFIDE', label: 'Bonafide Certificate' },
    { value: 'CHARACTER_CERT', label: 'Character Certificate' },
    { value: 'FEE_RECEIPT', label: 'Fee Receipt' },
    { value: 'NO_DUES', label: 'No Dues Certificate' },
]

interface Props {
    student: {
        id: string; firstName: string; middleName: string | null; lastName: string
        sisId: string; admissionNo: string
        sections?: { section: { name: string }; classYear: { classTemplate: { name: string } } }[]
    }
}

export function TransferOutClient({ student }: Props) {
    const router = useRouter()
    const fullName = [student.firstName, student.middleName, student.lastName].filter(Boolean).join(' ')
    const [step, setStep] = useState(1)
    const [submitting, setSubmitting] = useState(false)

    const [exitType, setExitType] = useState<string>('TRANSFER')
    const [exitDate, setExitDate] = useState('')
    const [destinationSchool, setDestinationSchool] = useState('')
    const [reason, setReason] = useState('')
    const [selectedDocs, setSelectedDocs] = useState<string[]>(['TRANSFER_CERT'])

    function toggleDoc(val: string) {
        setSelectedDocs(prev => prev.includes(val) ? prev.filter(d => d !== val) : [...prev, val])
    }

    async function handleSubmit() {
        setSubmitting(true)
        const res = await fetch(`/api/school/students/${student.id}/transfer`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                exitType, exitDate,
                destinationSchool: destinationSchool || undefined,
                reason: reason || undefined,
                documentsToGenerate: selectedDocs,
            }),
        })
        if (res.ok) {
            toast.success('Transfer processed successfully')
            router.push(`/management/students/${student.id}`)
            router.refresh()
        } else {
            const data = await res.json().catch(() => null)
            toast.error(data?.error ?? 'Failed to process transfer')
        }
        setSubmitting(false)
    }

    return (
        <div className="space-y-6 max-w-2xl">
            <div className="flex items-center gap-3">
                <Link href={`/management/students/${student.id}`}>
                    <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
                </Link>
                <h1 className="text-xl font-bold">Transfer / Exit — {fullName}</h1>
            </div>

            {/* Steps indicator */}
            <div className="flex items-center gap-2 text-sm">
                {['Exit Details', 'Documents', 'Confirm'].map((label, i) => (
                    <div key={label} className="flex items-center gap-2">
                        {i > 0 && <div className="h-px w-6 bg-border" />}
                        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium
                            ${step > i + 1 ? 'bg-green-100 text-green-700' : step === i + 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                            {step > i + 1 ? <Check className="h-3 w-3" /> : <span>{i + 1}</span>}
                            {label}
                        </div>
                    </div>
                ))}
            </div>

            <div className="rounded-xl border p-6 space-y-4">
                {/* Student summary */}
                <div className="rounded-lg bg-muted/30 p-3 text-sm space-y-1">
                    <p><span className="text-muted-foreground">Student:</span> <strong>{fullName}</strong></p>
                    <p><span className="text-muted-foreground">SIS ID:</span> {student.sisId} &middot; <span className="text-muted-foreground">Adm No:</span> {student.admissionNo}</p>
                    <p><span className="text-muted-foreground">Class:</span> {student.sections?.[0] ? `${student.sections[0].classYear.classTemplate.name} — ${student.sections[0].section.name}` : '—'}</p>
                </div>

                {step === 1 && (
                    <StepExitDetails
                        exitType={exitType} setExitType={setExitType}
                        exitDate={exitDate} setExitDate={setExitDate}
                        destinationSchool={destinationSchool} setDestinationSchool={setDestinationSchool}
                        reason={reason} setReason={setReason}
                    />
                )}
                {step === 2 && (
                    <StepDocuments selectedDocs={selectedDocs} toggleDoc={toggleDoc} />
                )}
                {step === 3 && (
                    <StepConfirm
                        exitType={exitType} exitDate={exitDate}
                        destinationSchool={destinationSchool} reason={reason}
                        selectedDocs={selectedDocs}
                    />
                )}
            </div>

            {/* Navigation buttons */}
            <div className="flex justify-between">
                <Button variant="outline" className="min-h-[44px]"
                    disabled={step === 1} onClick={() => setStep(s => s - 1)}>
                    <ArrowLeft className="h-4 w-4 mr-1.5" />Back
                </Button>
                {step < 3 ? (
                    <Button className="min-h-[44px]"
                        disabled={step === 1 && !exitDate}
                        onClick={() => setStep(s => s + 1)}>
                        Next<ArrowRight className="h-4 w-4 ml-1.5" />
                    </Button>
                ) : (
                    <Button className="min-h-[44px]" disabled={submitting} onClick={handleSubmit}>
                        {submitting ? 'Processing...' : 'Confirm & Process'}
                    </Button>
                )}
            </div>
        </div>
    )
}

function StepExitDetails({ exitType, setExitType, exitDate, setExitDate, destinationSchool, setDestinationSchool, reason, setReason }: {
    exitType: string; setExitType: (v: string) => void
    exitDate: string; setExitDate: (v: string) => void
    destinationSchool: string; setDestinationSchool: (v: string) => void
    reason: string; setReason: (v: string) => void
}) {
    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label>Exit Type</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {EXIT_TYPES.map(t => (
                        <button key={t.value} type="button"
                            className={`rounded-lg border p-3 text-left text-sm transition-colors min-h-[44px]
                                ${exitType === t.value ? 'border-primary bg-primary/5 font-medium' : 'hover:bg-muted/50'}`}
                            onClick={() => setExitType(t.value)}>
                            {t.label}
                        </button>
                    ))}
                </div>
            </div>
            <div className="space-y-2">
                <Label>Exit Date *</Label>
                <Input type="date" value={exitDate} onChange={e => setExitDate(e.target.value)} className="min-h-[44px]" />
            </div>
            {exitType === 'TRANSFER' && (
                <div className="space-y-2">
                    <Label>Destination School</Label>
                    <Input placeholder="Name of the school transferring to" value={destinationSchool}
                        onChange={e => setDestinationSchool(e.target.value)} className="min-h-[44px]" />
                </div>
            )}
            <div className="space-y-2">
                <Label>Reason (optional)</Label>
                <Input placeholder="Reason for exit" value={reason}
                    onChange={e => setReason(e.target.value)} className="min-h-[44px]" />
            </div>
        </div>
    )
}

function StepDocuments({ selectedDocs, toggleDoc }: { selectedDocs: string[]; toggleDoc: (v: string) => void }) {
    return (
        <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Select documents to generate with this exit:</p>
            {DOCUMENT_OPTIONS.map(doc => (
                <label key={doc.value} className="flex items-center gap-3 rounded-lg border p-3 cursor-pointer hover:bg-muted/50 min-h-[44px]">
                    <Checkbox checked={selectedDocs.includes(doc.value)}
                        onCheckedChange={() => toggleDoc(doc.value)} />
                    <span className="text-sm">{doc.label}</span>
                </label>
            ))}
        </div>
    )
}

function StepConfirm({ exitType, exitDate, destinationSchool, reason, selectedDocs }: {
    exitType: string; exitDate: string; destinationSchool: string; reason: string; selectedDocs: string[]
}) {
    const typeLabel = EXIT_TYPES.find(t => t.value === exitType)?.label ?? exitType
    const docLabels = selectedDocs.map(v => DOCUMENT_OPTIONS.find(d => d.value === v)?.label ?? v)

    return (
        <div className="space-y-3 text-sm">
            <p className="font-medium text-destructive">Please review before confirming. This action cannot be undone.</p>
            <div className="space-y-2 rounded-lg bg-muted/30 p-4">
                <Row label="Exit Type" value={typeLabel} />
                <Row label="Exit Date" value={exitDate ? new Date(exitDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'} />
                {destinationSchool && <Row label="Destination" value={destinationSchool} />}
                {reason && <Row label="Reason" value={reason} />}
                <Row label="Documents" value={docLabels.length ? docLabels.join(', ') : 'None'} />
            </div>
        </div>
    )
}

function Row({ label, value }: { label: string; value: string }) {
    return (
        <p><span className="text-muted-foreground">{label}: </span><span className="font-medium">{value}</span></p>
    )
}
