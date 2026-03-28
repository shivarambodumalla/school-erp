import { auth } from '@/server/auth'
import { redirect } from 'next/navigation'
import { AdmissionsPipelineClient } from
  '@/features/admissions/components/AdmissionsPipelineClient'

export default async function AdmissionsPage() {
  const session = await auth()
  if (!session) redirect('/auth/login')
  return <AdmissionsPipelineClient />
}
