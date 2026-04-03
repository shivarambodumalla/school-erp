'use client'

import { formatDistanceToNow } from 'date-fns'
import { generateColor, getInitials } from '@/lib/colors'
import { StudentHeroActions } from './StudentHeroActions'
import type { StudentProfile } from '../types'

interface Props {
    student: StudentProfile
    editMode: boolean
    onEditToggle: () => void
}

const STATUS_STYLES: Record<string, string> = {
    ACTIVE: 'bg-green-100 text-green-700',
    INACTIVE: 'bg-red-100 text-red-700',
    TRANSFERRED: 'bg-amber-100 text-amber-700',
}

const BOARDING_LABELS: Record<string, string> = {
    DAY_SCHOLAR: 'Day Scholar',
    BOARDER: 'Boarder',
}

export function StudentHero({ student, editMode, onEditToggle }: Props) {
    const s = student
    const fullName = [s.firstName, s.middleName, s.lastName].filter(Boolean).join(' ')
    const initials = getInitials(s.firstName, s.lastName)
    const joined = formatDistanceToNow(new Date(s.createdAt), { addSuffix: true })

    return (
        <div className="flex flex-col md:flex-row md:items-start gap-4">
            {/* Avatar */}
            <div className="shrink-0">
                {s.photoUrl ? (
                    <img
                        src={s.photoUrl}
                        alt={fullName}
                        className="h-20 w-20 rounded-xl object-cover"
                    />
                ) : (
                    <div className="h-20 w-20 rounded-xl flex items-center justify-center
                        text-gray-800 text-xl font-bold" style={{ backgroundColor: generateColor(s.firstName) }}>
                        {initials}
                    </div>
                )}
            </div>

            {/* Identity */}
            <div className="flex-1 min-w-0 space-y-1">
                <h1 className="text-2xl font-bold tracking-tight">{fullName}</h1>
                <p className="text-sm text-muted-foreground">
                    {s.sisId} · {s.admissionNo}{s.rollNo ? ` · Roll ${s.rollNo}` : ''}
                </p>
                <p className="text-sm text-muted-foreground">
                    {s.sections?.[0]
                        ? `${s.sections[0].classYear.classTemplate.name} — ${s.sections[0].section.name}`
                        : 'No class assigned'}
                    {s.bloodGroup ? ` · ${s.bloodGroup}` : ''}
                </p>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[s.status] ?? 'bg-gray-100'}`}>
                        {s.status}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                        {BOARDING_LABELS[s.boardingType] ?? s.boardingType}
                    </span>
                    <span className="text-xs text-muted-foreground">
                        Joined {joined}
                    </span>
                </div>
            </div>

            {/* Quick stats + actions */}
            <div className="flex flex-col items-end gap-3 shrink-0">
                <div className="flex gap-4 text-center">
                    <Stat label="Attendance" value="—%" />
                    <Stat label="Fees Due" value="₹—" />
                    <Stat label="Courses" value="—" />
                </div>
                <StudentHeroActions
                    student={student}
                    editMode={editMode}
                    onEditToggle={onEditToggle}
                />
            </div>
        </div>
    )
}

function Stat({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <p className="text-lg font-bold">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
        </div>
    )
}
