'use client'

import { HealthCard } from './HealthCard'
import { TransportCard } from './TransportCard'
import type { StudentProfile } from '../../types'

interface Props {
    student: StudentProfile
    onUpdated: (s: StudentProfile) => void
}

export function StudentHealthTab({ student, onUpdated }: Props) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <HealthCard student={student} onUpdated={onUpdated} />
            <TransportCard student={student} onUpdated={onUpdated} />
        </div>
    )
}
