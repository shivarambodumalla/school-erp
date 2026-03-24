import Link from 'next/link'
import { auth } from '@/server/auth'
import { redirect } from 'next/navigation'

export default async function TimetablePage() {
    const session = await auth()
    if (!session) redirect('/auth/login')

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Timetable</h1>
                <p className="text-muted-foreground text-sm mt-1">Class schedule management</p>
            </div>
            <div className="rounded-xl border bg-card p-8 text-center space-y-3">
                <p className="text-muted-foreground">
                    Timetable coming soon — add classes and staff first.
                </p>
                <Link
                    href="/management/institution/classes"
                    className="inline-flex items-center justify-center h-9 px-4 rounded-md border text-sm font-medium hover:bg-muted transition-colors"
                >
                    Go to Classes
                </Link>
            </div>
        </div>
    )
}
