import { auth } from '@/server/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

export default async function AnalyticsPage() {
    const session = await auth()
    if (!session || session.user.portalType !== 'SUPER_ADMIN') {
        redirect('/auth/login')
    }

    const [
        totalInstitutions,
        totalStudents,
        totalUsers,
        planBreakdown,
        boardBreakdown,
        recentSignups,
    ] = await Promise.all([
        prisma.institution.count(),
        prisma.student.count(),
        prisma.user.count(),
        prisma.institution.groupBy({ by: ['planTier'], _count: true }),
        prisma.institution.groupBy({ by: ['board'], _count: true }),
        prisma.institution.findMany({
            take: 12,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                name: true,
                createdAt: true,
                planTier: true,
                _count: { select: { students: true } },
            },
        }),
    ])

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Platform Analytics</h1>
                <p className="text-muted-foreground text-sm mt-1">Overview of all institutions on the platform</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Schools', value: totalInstitutions },
                    { label: 'Total Students', value: totalStudents },
                    { label: 'Total Users', value: totalUsers },
                    { label: 'Active Plans', value: planBreakdown.length },
                ].map((stat) => (
                    <div key={stat.label} className="rounded-xl border bg-card p-4 shadow-sm">
                        <p className="text-3xl font-bold">{stat.value}</p>
                        <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
                    </div>
                ))}
            </div>

            <div className="rounded-xl border bg-card p-6 shadow-sm">
                <h2 className="font-semibold mb-4">Plan Distribution</h2>
                <div className="space-y-3">
                    {planBreakdown.map((p) => (
                        <div key={p.planTier} className="flex items-center gap-4">
                            <span className="w-20 text-sm font-medium">{p.planTier}</span>
                            <div className="flex-1 bg-muted rounded-full h-2">
                                <div
                                    className="bg-primary h-2 rounded-full"
                                    style={{ width: `${totalInstitutions > 0 ? (p._count / totalInstitutions) * 100 : 0}%` }}
                                />
                            </div>
                            <span className="text-sm text-muted-foreground w-8">{p._count}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="rounded-xl border bg-card p-6 shadow-sm">
                <h2 className="font-semibold mb-4">Board Distribution</h2>
                <div className="space-y-3">
                    {boardBreakdown.map((b) => (
                        <div key={b.board} className="flex items-center gap-4">
                            <span className="w-20 text-sm font-medium">{b.board}</span>
                            <div className="flex-1 bg-muted rounded-full h-2">
                                <div
                                    className="bg-primary h-2 rounded-full"
                                    style={{ width: `${totalInstitutions > 0 ? (b._count / totalInstitutions) * 100 : 0}%` }}
                                />
                            </div>
                            <span className="text-sm text-muted-foreground w-8">{b._count}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="rounded-xl border bg-card p-6 shadow-sm">
                <h2 className="font-semibold mb-4">Recent Institutions</h2>
                <div className="space-y-2">
                    {recentSignups.map((inst) => (
                        <div key={inst.id} className="flex items-center justify-between py-2 border-b last:border-0">
                            <div>
                                <p className="text-sm font-medium">{inst.name}</p>
                                <p className="text-xs text-muted-foreground">{inst._count.students} students</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs font-medium">{inst.planTier}</p>
                                <p className="text-xs text-muted-foreground">
                                    {new Date(inst.createdAt).toLocaleDateString('en-IN')}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
