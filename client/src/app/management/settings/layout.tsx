import { auth } from '@/server/auth'
import { redirect } from 'next/navigation'
import { SettingsNav } from '@/features/school/components/SettingsNav'
import type { ReactNode } from 'react'

export default async function SettingsLayout({
  children,
}: {
  children: ReactNode
}) {
  const session = await auth()
  if (!session) redirect('/auth/login')
  if (session.user.portalType !== 'ADMIN') redirect('/management/dashboard')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your institution details, branding, and account
        </p>
      </div>
      <SettingsNav />
      {children}
    </div>
  )
}