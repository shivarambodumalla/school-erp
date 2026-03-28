'use client'

import { useState } from 'react'
import { StudentOverviewTab } from './tabs/StudentOverviewTab'
import { StudentAcademicsTab } from './tabs/StudentAcademicsTab'
import { StudentGuardiansTab } from './tabs/StudentGuardiansTab'
import { StudentHealthTab } from './tabs/StudentHealthTab'
import { StudentDocumentsTab } from './tabs/StudentDocumentsTab'
import { StudentActivityTab } from './tabs/StudentActivityTab'
import type { StudentProfile } from '../types'

const TABS = [
    { id: 'overview', label: 'Overview' },
    { id: 'academics', label: 'Academics' },
    { id: 'attendance', label: 'Attendance' },
    { id: 'fees', label: 'Fees' },
    { id: 'guardians', label: 'Guardians' },
    { id: 'health', label: 'Health' },
    { id: 'documents', label: 'Documents' },
    { id: 'activity', label: 'Activity' },
] as const

interface Props {
    student: StudentProfile
    portalType: string
    onStudentUpdated: (s: StudentProfile) => void
}

export function StudentTabs({ student, portalType, onStudentUpdated }: Props) {
    const [active, setActive] = useState<string>('overview')

    return (
        <div>
            <div className="flex gap-1 border-b overflow-x-auto scrollbar-none">
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActive(tab.id)}
                        className={`shrink-0 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors min-h-[44px]
                            ${active === tab.id
                                ? 'border-primary text-primary'
                                : 'border-transparent text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
            <div className="pt-5">
                {active === 'overview' && (
                    <StudentOverviewTab studentId={student.id} onSwitchTab={setActive} />
                )}
                {active === 'academics' && <StudentAcademicsTab studentId={student.id} />}
                {active === 'attendance' && <PlaceholderTab message="Attendance module available in Week 3" />}
                {active === 'fees' && <PlaceholderTab message="Fee module available in Week 5" />}
                {active === 'guardians' && (
                    <StudentGuardiansTab studentId={student.id} guardians={student.guardians} />
                )}
                {active === 'health' && (
                    <StudentHealthTab student={student} onUpdated={onStudentUpdated} />
                )}
                {active === 'documents' && (
                    <StudentDocumentsTab studentId={student.id} isAdmin={portalType === 'ADMIN'} />
                )}
                {active === 'activity' && (
                    <StudentActivityTab studentId={student.id} portalType={portalType} />
                )}
            </div>
        </div>
    )
}

function PlaceholderTab({ message }: { message: string }) {
    return (
        <div className="rounded-lg border bg-muted/30 p-8 text-center">
            <p className="text-sm text-muted-foreground">{message}</p>
        </div>
    )
}
