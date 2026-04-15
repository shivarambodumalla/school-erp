'use client'

import { useState, useMemo } from 'react'
import { StudentOverviewTab } from './tabs/StudentOverviewTab'
import { StudentAcademicsTab } from './tabs/StudentAcademicsTab'
import { StudentGuardiansTab } from './tabs/StudentGuardiansTab'
import { StudentHealthTab } from './tabs/StudentHealthTab'
import { StudentDocumentsTab } from './tabs/StudentDocumentsTab'
import { StudentActivityTab } from './tabs/StudentActivityTab'
import { StudentAdmissionTab } from './tabs/StudentAdmissionTab'
import { StudentKudosTab } from './tabs/StudentKudosTab'
import type { StudentProfile } from '../types'

const BASE_TABS = [
    { id: 'overview', label: 'Overview' },
    { id: 'academics', label: 'Academics' },
    { id: 'attendance', label: 'Attendance' },
    { id: 'fees', label: 'Fees' },
    { id: 'kudos', label: 'Kudos' },
    { id: 'guardians', label: 'Guardians' },
    { id: 'health', label: 'Health' },
    { id: 'documents', label: 'Documents' },
    { id: 'activity', label: 'Activity' },
]

interface Props {
    student: StudentProfile
    portalType: string
    onStudentUpdated: (s: StudentProfile) => void
}

export function StudentTabs({ student, portalType, onStudentUpdated }: Props) {
    const [active, setActive] = useState<string>('overview')

    const tabs = useMemo(() => {
        const list = [...BASE_TABS]
        if (student.admission) {
            list.push({ id: 'admission', label: 'Admission' })
        }
        return list
    }, [student.admission])

    return (
        <div>
            <div className="flex gap-1 border-b overflow-x-auto scrollbar-none">
                {tabs.map(tab => (
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
                {active === 'kudos' && (
                    <StudentKudosTab
                        studentId={student.id}
                        studentName={`${student.firstName} ${student.lastName}`}
                    />
                )}
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
                {active === 'admission' && student.admission && (
                    <StudentAdmissionTab admissionId={student.admission.id} />
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
