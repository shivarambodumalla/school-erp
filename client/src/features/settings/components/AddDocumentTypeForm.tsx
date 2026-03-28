'use client'

import { useState, useTransition } from 'react'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'

interface DocumentType {
    id: string
    name: string
    isRequired: boolean
    showInAdmission: boolean
    showInProfile: boolean
    order: number
}

interface Props {
    onAdded: (doc: DocumentType) => void
}

export function AddDocumentTypeForm({ onAdded }: Props) {
    const [name, setName] = useState('')
    const [isRequired, setIsRequired] = useState(false)
    const [isPending, startTransition] = useTransition()

    function handleAdd() {
        if (!name.trim()) return
        startTransition(async () => {
            const res = await fetch('/api/school/settings/documents', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: name.trim(), isRequired }),
            })
            if (res.ok) {
                const created = await res.json()
                onAdded(created)
                setName('')
                setIsRequired(false)
                toast.success('Document type added')
            } else {
                const err = await res.json()
                toast.error(err.error ?? 'Failed to add')
            }
        })
    }

    return (
        <div className="flex items-center gap-3 pt-2 border-t">
            <Input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="New document type name"
                className="min-h-[44px] flex-1"
                onKeyDown={e => e.key === 'Enter' && handleAdd()}
            />
            <label className="flex items-center gap-2 text-sm whitespace-nowrap">
                <Switch checked={isRequired} onCheckedChange={setIsRequired} />
                Required
            </label>
            <Button
                onClick={handleAdd}
                disabled={isPending || !name.trim()}
                size="sm"
                className="min-h-[44px]"
            >
                <Plus className="h-4 w-4 mr-1" />
                Add
            </Button>
        </div>
    )
}
