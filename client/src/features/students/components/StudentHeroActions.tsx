'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, CreditCard, MoreHorizontal, ArrowRightLeft, Link2, UserX, Printer, FileText, LogOut } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useConfirm } from '@/components/ui/confirm-dialog'
import { TransferClassModal } from './TransferClassModal'
import { LinkSiblingModal } from './LinkSiblingModal'
import type { StudentProfile } from '../types'

interface Props {
    student: StudentProfile
    editMode: boolean
    onEditToggle: () => void
}

export function StudentHeroActions({ student, editMode, onEditToggle }: Props) {
    const router = useRouter()
    const confirm = useConfirm()
    const [showMenu, setShowMenu] = useState(false)
    const [showTransfer, setShowTransfer] = useState(false)
    const [showSibling, setShowSibling] = useState(false)

    async function handleMarkInactive() {
        const ok = await confirm({
            title: 'Mark Inactive',
            description: 'Mark this student as inactive?',
            confirmLabel: 'Mark Inactive',
        })
        if (!ok) return
        const res = await fetch(`/api/school/students/${student.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'INACTIVE' }),
        })
        if (res.ok) {
            toast.success('Student marked inactive')
            router.refresh()
        } else {
            toast.error('Failed to update status')
        }
        setShowMenu(false)
    }

    return (
        <>
            <div className="flex items-center gap-2">
                <Button
                    variant={editMode ? 'secondary' : 'default'}
                    size="sm"
                    className="min-h-[44px]"
                    onClick={onEditToggle}
                >
                    <Pencil className="h-4 w-4 mr-1.5" />
                    {editMode ? 'Cancel Edit' : 'Edit Profile'}
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    className="min-h-[44px]"
                    onClick={() => router.push(`/management/students/${student.id}/id-card`)}
                >
                    <CreditCard className="h-4 w-4 mr-1.5" />
                    Issue ID Card
                </Button>
                <div className="relative">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10"
                        onClick={() => setShowMenu(!showMenu)}
                    >
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                    {showMenu && (
                        <div className="absolute right-0 top-11 z-20 w-56 rounded-lg border bg-popover shadow-md py-1">
                            <MenuItem icon={FileText} label="Issue Document"
                                onClick={() => { router.push(`/management/students/${student.id}/documents/issue`); setShowMenu(false) }} />
                            <MenuItem icon={LogOut} label="Transfer to New School"
                                onClick={() => { router.push(`/management/students/${student.id}/transfer`); setShowMenu(false) }} />
                            <div className="h-px bg-border my-1" />
                            <MenuItem icon={ArrowRightLeft} label="Transfer to New Class"
                                onClick={() => { setShowTransfer(true); setShowMenu(false) }} />
                            <MenuItem icon={Link2} label="Link Sibling"
                                onClick={() => { setShowSibling(true); setShowMenu(false) }} />
                            <div className="h-px bg-border my-1" />
                            <MenuItem icon={UserX} label="Mark Inactive"
                                onClick={handleMarkInactive} danger />
                            <MenuItem icon={Printer} label="Print Profile"
                                onClick={() => { window.print(); setShowMenu(false) }} />
                        </div>
                    )}
                </div>
            </div>

            {showTransfer && (
                <TransferClassModal
                    studentId={student.id}
                    currentClassId={student.sections?.[0]?.classYear.id ?? ''}
                    onClose={() => setShowTransfer(false)}
                    onTransferred={() => { setShowTransfer(false); router.refresh() }}
                />
            )}
            {showSibling && (
                <LinkSiblingModal
                    studentId={student.id}
                    onClose={() => setShowSibling(false)}
                />
            )}
        </>
    )
}

function MenuItem({ icon: Icon, label, onClick, danger }: {
    icon: React.ComponentType<{ className?: string }>
    label: string
    onClick: () => void
    danger?: boolean
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-muted
                ${danger ? 'text-destructive' : 'text-foreground'}`}
        >
            <Icon className="h-4 w-4" />
            {label}
        </button>
    )
}
