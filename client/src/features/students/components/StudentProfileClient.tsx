'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { StudentHero } from './StudentHero'
import { StudentTabs } from './StudentTabs'
import type { StudentProfile } from '../types'

interface Props {
    student: StudentProfile
    portalType: string
}

export function StudentProfileClient({ student: initial, portalType }: Props) {
    const [student, setStudent] = useState(initial)
    const [editMode, setEditMode] = useState(false)
    const router = useRouter()

    function handleSaved(updated: StudentProfile) {
        setStudent(updated)
        setEditMode(false)
        router.refresh()
    }

    return (
        <div className="space-y-6">
            <StudentHero
                student={student}
                editMode={editMode}
                onEditToggle={() => setEditMode(!editMode)}
            />
            <StudentTabs
                student={student}
                portalType={portalType}
                onStudentUpdated={handleSaved}
            />
        </div>
    )
}
