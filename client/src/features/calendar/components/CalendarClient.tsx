'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, ChevronRight, List, Grid, Plus } from 'lucide-react'
import { AddEventForm } from './AddEventForm'

interface CalendarEvent {
    id: string
    title: string
    description: string | null
    type: string
    startDate: Date
    endDate: Date
    isHoliday: boolean
}

interface Props {
    events: CalendarEvent[]
}

const EVENT_COLORS: Record<string, string> = {
    HOLIDAY: 'bg-red-500',
    EXAM: 'bg-blue-500',
    EVENT: 'bg-green-500',
    MEETING: 'bg-amber-500',
    DEADLINE: 'bg-orange-500',
    OTHER: 'bg-gray-500',
}

const EVENT_BORDER: Record<string, string> = {
    HOLIDAY: 'border-l-red-500',
    EXAM: 'border-l-blue-500',
    EVENT: 'border-l-green-500',
    MEETING: 'border-l-amber-500',
    DEADLINE: 'border-l-orange-500',
    OTHER: 'border-l-gray-500',
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function CalendarClient({ events }: Props) {
    const today = new Date()
    const [view, setView] = useState<'month' | 'list'>('month')
    const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1))
    const [selectedDay, setSelectedDay] = useState<Date | null>(null)
    const [showAddForm, setShowAddForm] = useState(false)

    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    function prevMonth() { setCurrentDate(new Date(year, month - 1, 1)) }
    function nextMonth() { setCurrentDate(new Date(year, month + 1, 1)) }

    function eventsOnDay(day: number) {
        const d = new Date(year, month, day)
        return events.filter((e) => {
            const start = new Date(e.startDate)
            const end = new Date(e.endDate)
            start.setHours(0, 0, 0, 0)
            end.setHours(23, 59, 59, 999)
            return d >= start && d <= end
        })
    }

    function eventsForSelectedDay() {
        if (!selectedDay) return []
        return eventsOnDay(selectedDay.getDate())
    }

    // Group events by month for list view
    const groupedByMonth = events.reduce<Record<string, CalendarEvent[]>>((acc, event) => {
        const key = `${new Date(event.startDate).getFullYear()}-${new Date(event.startDate).getMonth()}`
        if (!acc[key]) acc[key] = []
        acc[key].push(event)
        return acc
    }, {})

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">School Calendar</h1>
                    <p className="text-muted-foreground text-sm mt-1">{events.length} events</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex rounded-lg border overflow-hidden">
                        <Button variant={view === 'month' ? 'default' : 'ghost'} size="sm" onClick={() => setView('month')} className="rounded-none">
                            <Grid className="h-4 w-4" />
                        </Button>
                        <Button variant={view === 'list' ? 'default' : 'ghost'} size="sm" onClick={() => setView('list')} className="rounded-none">
                            <List className="h-4 w-4" />
                        </Button>
                    </div>
                    <Button size="sm" onClick={() => setShowAddForm(true)}>
                        <Plus className="h-4 w-4 mr-1.5" /> Add Event
                    </Button>
                </div>
            </div>

            {view === 'month' && (
                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Month Grid */}
                    <div className="lg:col-span-2 rounded-xl border bg-card overflow-hidden">
                        <div className="flex items-center justify-between p-4 border-b">
                            <button onClick={prevMonth} className="p-1 hover:bg-muted rounded">
                                <ChevronLeft className="h-5 w-5" />
                            </button>
                            <h2 className="font-semibold">{MONTHS[month]} {year}</h2>
                            <button onClick={nextMonth} className="p-1 hover:bg-muted rounded">
                                <ChevronRight className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="p-4">
                            {/* Day headers */}
                            <div className="grid grid-cols-7 mb-2">
                                {DAYS.map((d) => (
                                    <div key={d} className="text-center text-xs font-medium text-muted-foreground py-1">{d}</div>
                                ))}
                            </div>
                            {/* Days grid */}
                            <div className="grid grid-cols-7 gap-1">
                                {Array.from({ length: firstDay }).map((_, i) => (
                                    <div key={`empty-${i}`} />
                                ))}
                                {Array.from({ length: daysInMonth }).map((_, i) => {
                                    const day = i + 1
                                    const dayEvents = eventsOnDay(day)
                                    const isToday = today.getDate() === day && today.getMonth() === month && today.getFullYear() === year
                                    const isSelected = selectedDay?.getDate() === day && selectedDay?.getMonth() === month
                                    return (
                                        <button
                                            key={day}
                                            onClick={() => setSelectedDay(new Date(year, month, day))}
                                            className={`rounded-lg p-1 min-h-[44px] flex flex-col items-center transition-colors ${
                                                isSelected ? 'bg-primary text-primary-foreground' :
                                                isToday ? 'bg-primary/10 text-primary font-bold' :
                                                'hover:bg-muted'
                                            }`}
                                        >
                                            <span className="text-sm">{day}</span>
                                            <div className="flex gap-0.5 mt-0.5 flex-wrap justify-center">
                                                {dayEvents.slice(0, 3).map((e) => (
                                                    <span key={e.id} className={`h-1.5 w-1.5 rounded-full ${EVENT_COLORS[e.type] ?? 'bg-gray-500'}`} />
                                                ))}
                                            </div>
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Day Events Panel */}
                    <div className="rounded-xl border bg-card p-4 space-y-3">
                        <h3 className="font-semibold text-sm">
                            {selectedDay ? selectedDay.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Select a day'}
                        </h3>
                        {selectedDay && eventsForSelectedDay().length === 0 && (
                            <p className="text-sm text-muted-foreground">No events on this day</p>
                        )}
                        <div className="space-y-2">
                            {eventsForSelectedDay().map((event) => (
                                <div key={event.id} className={`rounded-lg border-l-4 ${EVENT_BORDER[event.type] ?? 'border-l-gray-500'} p-3 bg-muted/30`}>
                                    <p className="font-medium text-sm">{event.title}</p>
                                    {event.description && <p className="text-xs text-muted-foreground mt-0.5">{event.description}</p>}
                                    <Badge variant="outline" className="text-xs mt-1">{event.type}</Badge>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {view === 'list' && (
                <div className="space-y-6">
                    {Object.entries(groupedByMonth)
                        .sort(([a], [b]) => a.localeCompare(b))
                        .map(([key, monthEvents]) => {
                            const [y, m] = key.split('-').map(Number)
                            return (
                                <div key={key}>
                                    <h3 className="font-semibold text-sm text-muted-foreground mb-3">
                                        {MONTHS[m]} {y}
                                    </h3>
                                    <div className="space-y-2">
                                        {monthEvents.map((event) => (
                                            <div key={event.id} className={`rounded-xl border-l-4 ${EVENT_BORDER[event.type] ?? 'border-l-gray-500'} border bg-card p-4`}>
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <p className="font-medium">{event.title}</p>
                                                        <p className="text-xs text-muted-foreground mt-0.5">
                                                            {new Date(event.startDate).toLocaleDateString()} – {new Date(event.endDate).toLocaleDateString()}
                                                        </p>
                                                        {event.description && <p className="text-sm text-muted-foreground mt-1">{event.description}</p>}
                                                    </div>
                                                    <Badge variant="outline">{event.type}</Badge>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )
                        })}
                    {events.length === 0 && (
                        <p className="text-center text-muted-foreground py-12 text-sm">No events yet</p>
                    )}
                </div>
            )}

            {showAddForm && <AddEventForm onClose={() => setShowAddForm(false)} />}
        </div>
    )
}
