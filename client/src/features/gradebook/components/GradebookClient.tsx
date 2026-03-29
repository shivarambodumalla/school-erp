'use client'

import { useCallback, useEffect, useState } from 'react'
import { useInstitutionId } from '@/hooks/useInstitutionId'
import { Button } from '@/components/ui/button'
import { GradebookTable } from './GradebookTable'
import { BulkEntrySheet } from './BulkEntrySheet'
import type { GradebookData } from '../types'
import { exportGradebookCsv } from '../utils'

interface Props {
  subjectId: string
}

export function GradebookClient({ subjectId }: Props) {
  const { apiParam } = useInstitutionId()
  const [data, setData] = useState<GradebookData | null>(null)
  const [loading, setLoading] = useState(true)
  const [bulkOpen, setBulkOpen] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(
        `/api/school/subjects/${subjectId}/gradebook${apiParam}`,
      )
      if (res.ok) setData(await res.json())
    } finally {
      setLoading(false)
    }
  }, [subjectId])

  useEffect(() => { fetchData() }, [fetchData])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full
          border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!data) {
    return (
      <p className="text-center text-muted-foreground py-12">
        Failed to load gradebook.
      </p>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row
        sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {data.subject.name} Gradebook
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {data.students.length} students &middot;{' '}
            {data.examTypes.length} exams
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="min-h-[44px]"
            onClick={() => setBulkOpen(true)}
          >
            Bulk Entry
          </Button>
          <Button
            variant="outline"
            className="min-h-[44px]"
            onClick={() => exportGradebookCsv(data)}
          >
            Export CSV
          </Button>
        </div>
      </div>

      <GradebookTable
        data={data}
        subjectId={subjectId}
        onRefresh={fetchData}
      />

      <BulkEntrySheet
        open={bulkOpen}
        onOpenChange={setBulkOpen}
        subjectId={subjectId}
        examTypes={data.examTypes}
        students={data.students}
        onSaved={fetchData}
      />
    </div>
  )
}
