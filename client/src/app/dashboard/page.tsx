import { auth } from '@/server/auth'
import { redirect } from 'next/navigation'
import { isConsumerPortal } from '@/lib/permissions'

export default async function DashboardPage(): Promise<never> {
    const session = await auth()
    if (!session) redirect('/auth/login')

    // Route to correct shell dashboard
    if (session.user.portalType === 'SUPER_ADMIN') {
        redirect('/super/dashboard')
    } else if (isConsumerPortal(session.user.portalType)) {
        redirect('/consumer/dashboard')
    } else {
        redirect('/management/dashboard')
    }
}
