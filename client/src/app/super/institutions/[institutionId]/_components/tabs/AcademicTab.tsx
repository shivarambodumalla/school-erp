'use client'

import { useEffect, useState } from 'react'
import { BookOpen, Users, LayoutGrid, Clock } from 'lucide-react'
import { StatCard } from '@/components/shared/StatCard'

interface ClassRow {
  id: string
  name: string
  gradeLevel: number
  sectionCount: number
}

interface AcademicData {
  classCount: number
  sectionCount: number
  studentCount: number
  hasAcademicYear: boolean
  classes: ClassRow[]
}

interface Props { institutionId: string; apiBase: string }

export function AcademicTab({ institutionId, apiBase }: Props) {
  const [data, setData] = useState<AcademicData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    fetch(`${apiBase}/academic`, { signal: controller.signal })
      .then(r => r.json())
      .then(d => { setData(d as AcademicData); setLoading(false) })
      .catch(err => {
        if (err instanceof Error && err.name === 'AbortError') return
        setError(true)
        setLoading(false)
      })
    return () => controller.abort()
  }, [apiBase])

  if (loading) return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i}
          className="h-28 rounded-xl bg-muted animate-pulse" />
      ))}
    </div>
  )

  if (error || !data) return (
    <div className="rounded-xl border border-red-200 bg-red-50
      p-6 text-center text-red-700 text-sm">
      Failed to load academic data. Please refresh.
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Classes" value={String(data.classCount)}
          icon={BookOpen} color="blue" />
        <StatCard label="Sections" value={String(data.sectionCount)}
          icon={LayoutGrid} color="violet" />
        <StatCard label="Students" value={String(data.studentCount)}
          icon={Users} color="green" />
        <StatCard
          label="Academic Year"
          value={data.hasAcademicYear ? 'Set' : 'Not set'}
          icon={Clock}
          color={data.hasAcademicYear ? 'green' : 'red'}
        />
      </div>

      {/* Classes table */}
      <div className="rounded-xl border bg-card">
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h3 className="font-semibold">Classes</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {data.classCount} classes · {data.sectionCount} sections
            </p>
          </div>
        </div>
        {data.classes.length === 0 ? (
          <div className="flex flex-col items-center justify-center
            py-16 gap-3">
            <BookOpen className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm font-medium">No classes added yet</p>
            <p className="text-xs text-muted-foreground">
              School has not set up any classes
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  {['Class', 'Grade', 'Sections'].map(h => (
                    <th key={h}
                      className="text-left px-4 py-3 font-medium
                        text-muted-foreground text-xs uppercase
                        tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.classes.map(cls => (
                  <tr key={cls.id}
                    className="border-b last:border-0
                      hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 font-medium">
                      {cls.name}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      Grade {cls.gradeLevel}
                    </td>
                    <td className="px-4 py-3">{cls.sectionCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
