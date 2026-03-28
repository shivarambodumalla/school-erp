'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { BookOpen, Clock, Wifi, ArrowRight } from 'lucide-react'

interface SubjectItem {
  id: string
  name: string
  code: string | null
  weeklyPeriods: number
  hasOnlineContent: boolean
  teacher: string | null
}

interface SubjectsData {
  student: { id: string; firstName: string; lastName: string }
  classInfo: {
    className: string
    sectionName: string
    academicYear: string
  }
  subjects: SubjectItem[]
}

export function MySubjectsClient() {
  const [data, setData] = useState<SubjectsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/student/subjects')
      .then((r) => r.json())
      .then((d: SubjectsData) => setData(d))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full
          border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!data) {
    return <p className="text-muted-foreground p-4">No data found.</p>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Subjects</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {data.classInfo.className} - {data.classInfo.sectionName}
          {' | '}{data.classInfo.academicYear}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {data.subjects.map((s) => (
          <Link
            key={s.id}
            href={`/consumer/subjects/${s.id}`}
            className="rounded-xl border bg-card p-5 space-y-3
              hover:shadow-md transition-shadow block"
          >
            <div className="flex items-start justify-between">
              <div className="h-11 w-11 rounded-lg bg-primary/10
                text-primary flex items-center justify-center shrink-0">
                <BookOpen className="h-5 w-5" />
              </div>
              {s.hasOnlineContent && (
                <span className="inline-flex items-center gap-1 px-2
                  py-0.5 rounded-full text-xs font-medium
                  bg-blue-100 text-blue-700">
                  <Wifi className="h-3 w-3" /> Online
                </span>
              )}
            </div>
            <p className="font-bold text-lg leading-tight">{s.name}</p>
            <div className="flex items-center gap-4 text-sm
              text-muted-foreground">
              {s.teacher && <span>{s.teacher}</span>}
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {s.weeklyPeriods} periods/wk
              </span>
            </div>
            <span className="inline-flex items-center gap-1 text-sm
              font-medium text-primary min-h-[44px]">
              View <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
