'use client'

import { useState, useTransition, useCallback } from 'react'
import { DndContext, closestCenter, type DragEndEvent } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { SortableDocRow } from './SortableDocRow'
import { AddDocumentTypeForm } from './AddDocumentTypeForm'

interface DocumentType {
    id: string
    name: string
    isRequired: boolean
    showInAdmission: boolean
    showInProfile: boolean
    order: number
}

interface Props {
    initialDocTypes: DocumentType[]
}

export function DocumentTypesCard({ initialDocTypes }: Props) {
    const [docs, setDocs] = useState<DocumentType[]>(initialDocTypes)
    const [, startTransition] = useTransition()

    const handleToggle = useCallback((id: string, field: keyof DocumentType, value: boolean) => {
        setDocs(prev => prev.map(d => d.id === id ? { ...d, [field]: value } : d))
        startTransition(async () => {
            const res = await fetch(`/api/school/settings/documents/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ [field]: value }),
            })
            if (!res.ok) {
                setDocs(prev => prev.map(d => d.id === id ? { ...d, [field]: !value } : d))
                toast.error('Failed to update')
            }
        })
    }, [])

    const handleDelete = useCallback((id: string) => {
        startTransition(async () => {
            const res = await fetch(`/api/school/settings/documents/${id}`, { method: 'DELETE' })
            if (res.ok) {
                setDocs(prev => prev.filter(d => d.id !== id))
                toast.success('Document type removed')
            } else {
                const err = await res.json()
                toast.error(err.error ?? 'Failed to delete')
            }
        })
    }, [])

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event
        if (!over || active.id === over.id) return

        setDocs(prev => {
            const oldIdx = prev.findIndex(d => d.id === active.id)
            const newIdx = prev.findIndex(d => d.id === over.id)
            const reordered = arrayMove(prev, oldIdx, newIdx)
                .map((d, i) => ({ ...d, order: i }))

            // Persist new order
            for (const doc of reordered) {
                fetch(`/api/school/settings/documents/${doc.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ order: doc.order }),
                })
            }
            return reordered
        })
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Required Documents</CardTitle>
                <CardDescription>
                    Documents students must submit during admission and enrollment
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {docs.length > 0 && (
                    <div className="space-y-1">
                        <div className="grid grid-cols-[auto_1fr_70px_70px_70px_40px] gap-2 px-2 text-xs text-muted-foreground font-medium">
                            <span />
                            <span>Name</span>
                            <span className="text-center">Required</span>
                            <span className="text-center">Admission</span>
                            <span className="text-center">Profile</span>
                            <span />
                        </div>
                        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                            <SortableContext items={docs.map(d => d.id)} strategy={verticalListSortingStrategy}>
                                {docs.map(doc => (
                                    <SortableDocRow
                                        key={doc.id}
                                        doc={doc}
                                        onToggle={handleToggle}
                                        onDelete={handleDelete}
                                    />
                                ))}
                            </SortableContext>
                        </DndContext>
                    </div>
                )}
                <AddDocumentTypeForm onAdded={doc => setDocs(prev => [...prev, doc])} />
            </CardContent>
        </Card>
    )
}
