'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Download, ShieldOff } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useConfirm } from '@/components/ui/confirm-dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { IdCardPreview } from './IdCardPreview'

interface Props {
    student: {
        id: string; firstName: string; middleName: string | null; lastName: string
        sisId: string; admissionNo: string; rollNo: string | null
        photoUrl: string | null; bloodGroup: string | null; gender: string
        class: { name: string }; section: { name: string }
    }
    institution: { name: string; logoUrl: string | null; primaryColor: string }
    activeCard: { id: string; issuedAt: string; validTill: string; fileUrl: string | null } | null
}

export function IdCardClient({ student, institution, activeCard: initial }: Props) {
    const router = useRouter()
    const confirm = useConfirm()
    const [card, setCard] = useState(initial)
    const [validTill, setValidTill] = useState('')
    const [issuing, setIssuing] = useState(false)

    async function handleIssue() {
        setIssuing(true)
        const res = await fetch(`/api/school/students/${student.id}/id-card`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(validTill ? { validTill } : {}),
        })
        if (res.ok) {
            toast.success('ID card issued')
            router.refresh()
        } else {
            toast.error('Failed to issue ID card')
        }
        setIssuing(false)
    }

    async function handleRevoke() {
        if (!card) return
        const ok = await confirm({
            title: 'Revoke ID Card',
            description: 'Are you sure you want to revoke this ID card?',
            confirmLabel: 'Revoke',
        })
        if (!ok) return
        const res = await fetch(`/api/school/students/${student.id}/id-card/${card.id}`, {
            method: 'DELETE',
        })
        if (res.ok) {
            toast.success('ID card revoked')
            setCard(null)
        } else {
            toast.error('Failed to revoke')
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <Link href={`/management/students/${student.id}`}>
                    <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
                </Link>
                <h1 className="text-xl font-bold">ID Card — {student.firstName} {student.lastName}</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex justify-center" id="id-card-print">
                    <IdCardPreview
                        student={student}
                        institution={institution}
                        validTill={card?.validTill}
                    />
                </div>

                <div className="space-y-4">
                    {card ? (
                        <>
                            <div className="rounded-lg border bg-green-50 p-4 space-y-2">
                                <p className="text-sm font-medium text-green-700">Active card issued</p>
                                <p className="text-xs text-muted-foreground">
                                    Issued: {new Date(card.issuedAt).toLocaleDateString('en-IN')}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Valid till: {new Date(card.validTill).toLocaleDateString('en-IN')}
                                </p>
                            </div>
                            <Button className="w-full min-h-[44px]" onClick={() => window.print()}>
                                <Download className="h-4 w-4 mr-2" />Download PDF
                            </Button>
                            <Button variant="destructive" className="w-full min-h-[44px]" onClick={handleRevoke}>
                                <ShieldOff className="h-4 w-4 mr-2" />Revoke Card
                            </Button>
                        </>
                    ) : (
                        <>
                            <div className="rounded-lg border bg-muted/30 p-4">
                                <p className="text-sm text-muted-foreground">No active ID card</p>
                            </div>
                            <div className="space-y-2">
                                <Label>Valid Till (optional — defaults from settings)</Label>
                                <Input type="date" value={validTill} onChange={e => setValidTill(e.target.value)}
                                    className="min-h-[44px]" />
                            </div>
                            <Button className="w-full min-h-[44px]" onClick={handleIssue} disabled={issuing}>
                                {issuing ? 'Issuing...' : 'Issue ID Card'}
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
