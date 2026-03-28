'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import type { ClassGradebookData } from '../types'
import { exportClassGradebookCsv } from '../utils'

interface Props {
  classYearId: string
}

export function ClassGradebookClient({ classYearId }: Props) {
  const router = useRouter()
  const [data, setData] = useState<ClassGradebookData | null>(null)
  const [loading, setLoading] = useState(true)
  const [section, setSection] = useState<string>('')
  const [sections, setSections] = useState<
    { id: string; name: string }[]
  >([])

  const fetchSections = useCallback(async () => {
    const res = await fetch(
      `/api/school/classes/${classYearId}/sections`,
    )
    if (res.ok) {
      const list = await res.json()
      setSections(list)
    }
  }, [classYearId])

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const url = `/api/school/classes/${classYearId}/gradebook${
        section ? `?sectionId=${section}` : ''
      }`
      const res = await fetch(url)
      if (res.ok) setData(await res.json())
    } finally {
      setLoading(false)
    }
  }, [classYearId, section])

  useEffect(() => { fetchSections() }, [fetchSections])
  useEffect(() => { fetchData() }, [fetchData])

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row
        sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold tracking-tight">
          Class Gradebook
        </h1>
        <Button
          variant="outline"
          className="min-h-[44px]"
          onClick={() => data && exportClassGradebookCsv(data)}
          disabled={!data}
        >
          Export CSV
        </Button>
      </div>

      {sections.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          <button
            className={`min-h-[44px] px-4 py-2 rounded-full
              text-sm font-medium border transition-colors ${
              !section
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-muted'
            }`}
            onClick={() => setSection('')}
          >
            All
          </button>
          {sections.map((s) => (
            <button
              key={s.id}
              className={`min-h-[44px] px-4 py-2 rounded-full
                text-sm font-medium border transition-colors ${
                section === s.id
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted'
              }`}
              onClick={() => setSection(s.id)}
            >
              {s.name}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full
            border-4 border-primary border-t-transparent" />
        </div>
      ) : !data ? (
        <p className="text-center text-muted-foreground py-12">
          Failed to load class gradebook.
        </p>
      ) : (
        <div className="rounded-xl border bg-card overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="sticky left-0 z-10 bg-muted/50
                  w-48 min-w-[192px] px-4 py-3 text-left
                  font-medium">
                  Student
                </th>
                {data.subjects.map((s) => (
                  <th
                    key={s.id}
                    className="px-3 py-3 text-center
                      font-medium min-w-[80px]"
                  >
                    {s.code ?? s.name}
                  </th>
                ))}
                <th className="px-3 py-3 text-center font-medium">
                  Overall %
                </th>
                <th className="px-3 py-3 text-center font-medium">
                  Grade
                </th>
              </tr>
            </thead>
            <tbody>
              {data.students.map((s) => (
                <tr
                  key={s.studentId}
                  className="border-b last:border-0 cursor-pointer
                    hover:bg-muted/30"
                  onClick={() =>
                    router.push(`/management/students/${s.studentId}`)
                  }
                >
                  <td className="sticky left-0 z-10 bg-card px-4
                    py-2 whitespace-nowrap">
                    <span className="font-medium">
                      {s.firstName} {s.lastName}
                    </span>
                    <span className="text-xs text-muted-foreground
                      ml-2">
                      {s.rollNo && `#${s.rollNo}`}{' '}
                      {s.sectionName}
                    </span>
                  </td>
                  {data.subjects.map((subj) => {
                    const sum = s.subjectSummaries[subj.id]
                    return (
                      <td
                        key={subj.id}
                        className="px-3 py-2 text-center"
                      >
                        {sum ? (
                          <span>
                            {sum.percentage}%{' '}
                            <span className="text-xs
                              text-muted-foreground">
                              {sum.grade}
                            </span>
                          </span>
                        ) : (
                          '\u2014'
                        )}
                      </td>
                    )
                  })}
                  <td className="px-3 py-2 text-center font-medium">
                    {s.overallPercentage}%
                  </td>
                  <td className="px-3 py-2 text-center">
                    {s.overallGrade ?? '\u2014'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
