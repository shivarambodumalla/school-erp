import { auth } from '@/server/auth'
import { redirect } from 'next/navigation'
import { AuditTab } from
  '@/app/super/institutions/[institutionId]/_components/tabs/AuditTab'

export default async function AuditPage() {
  const session = await auth()
  if (!session) redirect('/auth/login')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Audit Log</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Track all admin actions in your institution
        </p>
      </div>
      <AuditTab
        institutionId={session.user.institutionId}
        apiBase="/api/school"
      />
    </div>
  )
}
