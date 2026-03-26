import { auth } from '@/server/auth'
import { redirect } from 'next/navigation'
import { PeopleTab } from
  '@/app/super/institutions/[institutionId]/_components/tabs/PeopleTab'

export default async function UsersPage() {
  const session = await auth()
  if (!session) redirect('/auth/login')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">People</h1>
        <p className="text-sm text-muted-foreground mt-1">
          All users in your institution
        </p>
      </div>
      <PeopleTab
        institutionId={session.user.institutionId}
        apiBase="/api/school"
      />
    </div>
  )
}
