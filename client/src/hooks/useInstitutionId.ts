'use client'

import { useParams } from 'next/navigation'
import { useMemo, useCallback } from 'react'

export function useInstitutionId() {
  const params = useParams()
  const institutionId = params?.institutionId as string | undefined

  const addParams = useCallback(
    (existing: URLSearchParams) => {
      if (institutionId) existing.set('iid', institutionId)
      return existing
    },
    [institutionId],
  )

  return useMemo(
    () => ({
      institutionId: institutionId ?? null,
      iid: institutionId ?? '',
      apiParam: institutionId ? `?iid=${institutionId}` : '',
      addParams,
      isSuperAdmin: !!institutionId,
    }),
    [institutionId, addParams],
  )
}
