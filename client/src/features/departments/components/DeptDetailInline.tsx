'use client'

import { useEffect, useState, useCallback } from 'react'
import { useInstitutionId } from '@/hooks/useInstitutionId'
import { DepartmentDetailClient } from './DepartmentDetailClient'

interface Props {
  deptId: string
}

export function DeptDetailInline({ deptId }: Props) {
  const { apiParam } = useInstitutionId()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [dept, setDept] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const fetchDept = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const res = await fetch(`/api/school/departments/${deptId}${apiParam}`)
      if (!res.ok) throw new Error('Not found')
      setDept(await res.json())
    } catch {
      setError(true)
    }
    setLoading(false)
  }, [deptId, apiParam])

  useEffect(() => { fetchDept() }, [fetchDept])

  if (loading) {
    return (
      <div className="space-y-6 pt-4">
        <div className="flex items-center gap-4">
          <div className="h-20 w-20 rounded-xl bg-muted animate-pulse shrink-0" />
          <div className="space-y-2 flex-1">
            <div className="h-5 w-48 rounded bg-muted animate-pulse" />
            <div className="h-4 w-32 rounded bg-muted animate-pulse" />
          </div>
        </div>
        <div className="h-64 rounded-xl bg-muted animate-pulse" />
      </div>
    )
  }

  if (error || !dept) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50
        p-6 text-center text-red-700 text-sm mt-4">
        Failed to load department. Please try again.
      </div>
    )
  }

  return <DepartmentDetailClient department={dept} isAdmin />
}
