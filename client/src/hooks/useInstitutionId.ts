'use client'

import { useParams } from 'next/navigation'

export function useInstitutionId() {
  const params = useParams()
  const institutionId =
    params?.institutionId as string | undefined

  if (institutionId) {
    return {
      institutionId,
      iid: institutionId,
      apiParam: `?iid=${institutionId}`,
      addParams: (existing: URLSearchParams) => {
        existing.set('iid', institutionId)
        return existing
      },
      isSuperAdmin: true,
    }
  }

  return {
    institutionId: null,
    iid: '',
    apiParam: '',
    addParams: (existing: URLSearchParams) => existing,
    isSuperAdmin: false,
  }
}
