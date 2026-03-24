import { auth } from '@/server/auth'
import { redirect } from 'next/navigation'

export default async function PlatformSettingsPage() {
    const session = await auth()
    if (!session || session.user.portalType !== 'SUPER_ADMIN') {
        redirect('/auth/login')
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Platform Settings</h1>
                <p className="text-muted-foreground text-sm mt-1">Configure platform-wide settings</p>
            </div>
            <div className="rounded-xl border bg-card p-6 shadow-sm">
                <p className="text-muted-foreground text-sm">Platform settings coming soon.</p>
            </div>
        </div>
    )
}
