'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { X } from 'lucide-react'
import { createCalendarEvent } from '@/features/calendar/actions/calendarActions'

const EVENT_TYPES = [
    { value: 'HOLIDAY', label: 'Holiday' },
    { value: 'EXAM', label: 'Exam' },
    { value: 'EVENT', label: 'Event' },
    { value: 'MEETING', label: 'Meeting' },
    { value: 'DEADLINE', label: 'Deadline' },
    { value: 'OTHER', label: 'Other' },
] as const

interface Props {
    onClose: () => void
}

export function AddEventForm({ onClose }: Props) {
    const [isPending, startTransition] = useTransition()
    const [title, setTitle] = useState('')
    const [type, setType] = useState<string>('EVENT')
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [isHoliday, setIsHoliday] = useState(false)
    const [description, setDescription] = useState('')

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        startTransition(async () => {
            await createCalendarEvent({
                title,
                type: type as Parameters<typeof createCalendarEvent>[0]['type'],
                startDate,
                endDate,
                isHoliday,
                description: description || undefined,
            })
            onClose()
        })
    }

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-background rounded-xl border w-full max-w-md p-6 space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-lg">Add Event</h2>
                    <button onClick={onClose}><X className="h-4 w-4" /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1">
                        <Label>Title</Label>
                        <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
                    </div>
                    <div className="space-y-1">
                        <Label>Type</Label>
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                            {EVENT_TYPES.map((t) => (
                                <option key={t.value} value={t.value}>{t.label}</option>
                            ))}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <Label>Start Date</Label>
                            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
                        </div>
                        <div className="space-y-1">
                            <Label>End Date</Label>
                            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Switch id="holiday" checked={isHoliday} onCheckedChange={setIsHoliday} />
                        <Label htmlFor="holiday">Mark as Holiday</Label>
                    </div>
                    <div className="space-y-1">
                        <Label>Description (optional)</Label>
                        <Input value={description} onChange={(e) => setDescription(e.target.value)} />
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                        <Button type="submit" disabled={isPending}>{isPending ? 'Saving…' : 'Add Event'}</Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
