import { auth } from '@/server/auth'
import { redirect } from 'next/navigation'
import { RiskTab } from
  '@/app/super/institutions/[institutionId]/_components/tabs/RiskTab'

export default async function RiskPage() {
  const session = await auth()
  if (!session) redirect('/auth/login')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Risk Signals</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Health indicators for your institution
        </p>
      </div>
      <RiskTab
        institutionId={session.user.institutionId}
        apiBase="/api/school"
      />
    </div>
  )
}
