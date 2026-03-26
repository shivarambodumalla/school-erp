import { auth } from '@/server/auth'
import { redirect } from 'next/navigation'
import { SupportTab } from
  '@/app/super/institutions/[institutionId]/_components/tabs/SupportTab'

export default async function TicketsPage() {
  const session = await auth()
  if (!session) redirect('/auth/login')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Support</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Raise and track support tickets
        </p>
      </div>
      <SupportTab
        institutionId={session.user.institutionId}
        apiBase="/api/school"
      />
    </div>
  )
}
