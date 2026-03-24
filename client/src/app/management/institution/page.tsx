import { auth } from '@/server/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function InstitutionPage() {
    const session = await auth()
    if (!session) redirect('/auth/login')

    const institution = await prisma.institution.findUnique({
        where: { id: session.user.institutionId },
        select: {
            id: true,
            name: true,
            subdomain: true,
            board: true,
            planTier: true,
            primaryColor: true,
            logoUrl: true,
            isActive: true,
            createdAt: true,
            _count: { select: { users: true, students: true } },
        },
    })

    if (!institution) redirect('/auth/login')

    const quickActions = [
        { label: 'Classes', href: '/management/institution/classes', desc: 'Manage classes & sections' },
        { label: 'Staff', href: '/management/staff', desc: 'View teachers & instructors' },
        { label: 'Students', href: '/management/students', desc: 'Manage student roster' },
        { label: 'Settings', href: '/management/settings', desc: 'School configuration' },
    ]

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">{institution.name}</h1>
                <p className="text-muted-foreground text-sm mt-1">{institution.subdomain} · {institution.board} · {institution.planTier}</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="rounded-xl border bg-card p-4">
                    <p className="text-2xl font-bold">{institution._count.students}</p>
                    <p className="text-sm text-muted-foreground mt-1">Students</p>
                </div>
                <div className="rounded-xl border bg-card p-4">
                    <p className="text-2xl font-bold">{institution._count.users}</p>
                    <p className="text-sm text-muted-foreground mt-1">Users</p>
                </div>
                <div className="rounded-xl border bg-card p-4">
                    <p className="text-2xl font-bold">{institution.board}</p>
                    <p className="text-sm text-muted-foreground mt-1">Board</p>
                </div>
                <div className="rounded-xl border bg-card p-4">
                    <p className="text-2xl font-bold">{institution.planTier}</p>
                    <p className="text-sm text-muted-foreground mt-1">Plan</p>
                </div>
            </div>

            <div>
                <h2 className="font-semibold mb-3">Quick Actions</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {quickActions.map((action) => (
                        <Link
                            key={action.href}
                            href={action.href}
                            className="rounded-xl border bg-card p-4 hover:shadow-sm transition-shadow"
                        >
                            <p className="font-medium">{action.label}</p>
                            <p className="text-xs text-muted-foreground mt-1">{action.desc}</p>
                        </Link>
                    ))}
                </div>
            </div>

            <div className="rounded-xl border bg-card p-4 text-sm space-y-2">
                <h3 className="font-semibold">School Details</h3>
                <div className="grid sm:grid-cols-2 gap-2 text-muted-foreground">
                    <div><span className="font-medium text-foreground">Subdomain:</span> {institution.subdomain}</div>
                    <div><span className="font-medium text-foreground">Status:</span> {institution.isActive ? 'Active' : 'Suspended'}</div>
                    <div><span className="font-medium text-foreground">Created:</span> {new Date(institution.createdAt).toLocaleDateString()}</div>
                </div>
            </div>
        </div>
    )
}
