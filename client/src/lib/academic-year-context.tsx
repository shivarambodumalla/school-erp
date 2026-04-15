'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import type { ReactNode } from 'react'
import { useInstitutionId } from '@/hooks/useInstitutionId'

interface AcademicYearData {
  id: string
  name: string
  isCurrent: boolean
}

interface AcademicYearContextValue {
  selectedYearId: string
  selectedYear: AcademicYearData | null
  setSelectedYearId: (id: string) => void
  allYears: AcademicYearData[]
  loading: boolean
}

const AcademicYearContext = createContext<AcademicYearContextValue | null>(null)

const SESSION_STORAGE_KEY = 'onflows_academic_year_id'

export function AcademicYearProvider({ children }: { children: ReactNode }) {
  const { apiParam } = useInstitutionId()
  const [allYears, setAllYears] = useState<AcademicYearData[]>([])
  const [selectedYearId, setSelectedYearIdState] = useState<string>('')
  const [loading, setLoading] = useState(true)

  const fetchYears = useCallback(async () => {
    try {
      const res = await fetch(`/api/school/academic-years${apiParam}`)
      if (res.ok) {
        const data = await res.json() as AcademicYearData[]
        setAllYears(data)
      }
    } catch {
      // silently fail, years will be empty
    }
  }, [apiParam])

  const fetchCurrentYear = useCallback(async () => {
    try {
      // Check sessionStorage first for instant restore
      const cached = sessionStorage.getItem(SESSION_STORAGE_KEY)
      if (cached) {
        setSelectedYearIdState(cached)
      }

      const res = await fetch(`/api/school/academic-years/current${apiParam}`)
      if (res.ok) {
        const data = await res.json() as AcademicYearData
        setSelectedYearIdState(data.id)
        sessionStorage.setItem(SESSION_STORAGE_KEY, data.id)
      }
    } catch {
      // silently fail
    }
  }, [apiParam])

  useEffect(() => {
    async function init() {
      setLoading(true)
      await Promise.all([fetchYears(), fetchCurrentYear()])
      setLoading(false)
    }
    init()
  }, [fetchYears, fetchCurrentYear])

  const setSelectedYearId = useCallback(
    async (id: string) => {
      setSelectedYearIdState(id)
      sessionStorage.setItem(SESSION_STORAGE_KEY, id)

      try {
        await fetch(`/api/school/academic-years/current${apiParam}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ academicYearId: id }),
        })
      } catch {
        // preference save failed; local state still updated
      }
    },
    [apiParam],
  )

  const selectedYear = useMemo(
    () => allYears.find((y) => y.id === selectedYearId) ?? null,
    [allYears, selectedYearId],
  )

  const value = useMemo<AcademicYearContextValue>(
    () => ({
      selectedYearId,
      selectedYear,
      setSelectedYearId,
      allYears,
      loading,
    }),
    [selectedYearId, selectedYear, setSelectedYearId, allYears, loading],
  )

  return (
    <AcademicYearContext.Provider value={value}>
      {children}
    </AcademicYearContext.Provider>
  )
}

export function useAcademicYear(): AcademicYearContextValue {
  const ctx = useContext(AcademicYearContext)
  if (!ctx) {
    throw new Error(
      'useAcademicYear must be used within an AcademicYearProvider',
    )
  }
  return ctx
}
