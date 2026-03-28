'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Trash2, GripVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
    doc: DocumentType
    onToggle: (id: string, field: keyof DocumentType, value: boolean) => void
    onDelete: (id: string) => void
}

export function SortableDocRow({ doc, onToggle, onDelete }: Props) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: doc.id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="grid grid-cols-[auto_1fr_70px_70px_70px_40px] gap-2 items-center
                       px-2 py-2 rounded-lg border min-h-[44px] bg-background"
        >
            <button
                type="button"
                className="cursor-grab active:cursor-grabbing touch-none"
                {...attributes}
                {...listeners}
            >
                <GripVertical className="h-4 w-4 text-muted-foreground" />
            </button>
            <span className="text-sm font-medium truncate">{doc.name}</span>
            <div className="flex justify-center">
                <Switch
                    checked={doc.isRequired}
                    onCheckedChange={v => onToggle(doc.id, 'isRequired', v)}
                />
            </div>
            <div className="flex justify-center">
                <Switch
                    checked={doc.showInAdmission}
                    onCheckedChange={v => onToggle(doc.id, 'showInAdmission', v)}
                />
            </div>
            <div className="flex justify-center">
                <Switch
                    checked={doc.showInProfile}
                    onCheckedChange={v => onToggle(doc.id, 'showInProfile', v)}
                />
            </div>
            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={() => onDelete(doc.id)}
            >
                <Trash2 className="h-4 w-4" />
            </Button>
        </div>
    )
}
