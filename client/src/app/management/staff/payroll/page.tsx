import { auth } from '@/server/auth'
import { redirect } from 'next/navigation'
import { PayrollClient } from '@/features/staff/components/PayrollClient'

export default async function PayrollPage() {
  const session = await auth()
  if (!session) redirect('/auth/login')
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Payroll</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Process and manage staff salaries
        </p>
      </div>
      <PayrollClient />
    </div>
  )
}
