'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { SubjectStream } from './SubjectStream'
import { SubjectClasswork } from './SubjectClasswork'
import type { SubjectDetail } from '../types'

interface Props {
  subject: SubjectDetail
}

type TabKey = 'stream' | 'classwork' | 'gradebook'

const TABS: { key: TabKey; label: string }[] = [
  { key: 'stream', label: 'Stream' },
  { key: 'classwork', label: 'Classwork' },
  { key: 'gradebook', label: 'Gradebook' },
]

export function SubjectPageClient({ subject }: Props) {
  const [tab, setTab] = useState<TabKey>('stream')

  const classLabel = `${subject.classYear.classTemplate.name}${
    subject.section ? ` - ${subject.section.name}` : ''
  }`

  const teacherNames = subject.teachers
    .map((t) => t.user.email.split('@')[0])
    .join(', ')

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row
        sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {subject.name}
          </h1>
          <div className="flex items-center gap-2 mt-1
            flex-wrap text-sm text-muted-foreground">
            <Badge variant="secondary">{classLabel}</Badge>
            {subject.code && (
              <Badge variant="outline">{subject.code}</Badge>
            )}
            <span>{teacherNames}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-medium
              border-b-2 transition-colors min-h-[44px]
              ${
                tab === t.key
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {tab === 'stream' && (
        <SubjectStream subjectId={subject.id} />
      )}
      {tab === 'classwork' && (
        <SubjectClasswork subjectId={subject.id} />
      )}
      {tab === 'gradebook' && (
        <GradebookPlaceholder />
      )}
    </div>
  )
}

function GradebookPlaceholder() {
  return (
    <div className="rounded-xl border bg-card p-16
      flex flex-col items-center justify-center gap-4
      text-center">
      <p className="font-semibold">
        Gradebook coming soon
      </p>
      <p className="text-sm text-muted-foreground
        max-w-sm">
        View and manage student grades for exams,
        assignments, and quizzes.
      </p>
    </div>
  )
}
