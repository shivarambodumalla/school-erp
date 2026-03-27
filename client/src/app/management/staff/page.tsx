import { auth } from '@/server/auth'
import { redirect } from 'next/navigation'
import { StaffBasicClient } from
  '@/features/staff/components/StaffBasicClient'

export default async function StaffPage() {
  const session = await auth()
  if (!session) redirect('/auth/login')
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Staff
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            All staff members in your institution
          </p>
        </div>
      </div>
      <StaffBasicClient />
    </div>
  )
}