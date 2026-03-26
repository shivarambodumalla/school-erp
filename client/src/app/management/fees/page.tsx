import { auth } from '@/server/auth'
import { redirect } from 'next/navigation'
import { FinanceTab } from
  '@/app/super/institutions/[institutionId]/_components/tabs/FinanceTab'

export default async function FeesPage() {
  const session = await auth()
  if (!session) redirect('/auth/login')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Fees</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Fee collection and payment history
        </p>
      </div>
      <FinanceTab
        institutionId={session.user.institutionId}
        apiBase="/api/school"
      />
    </div>
  )
}
